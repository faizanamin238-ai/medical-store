-- Capture both old and new values for UPDATEs in the audit log.
--
-- Previously, audit_row_change recorded UPDATEs as { field: new_value }, which
-- made it impossible to render a "before -> after" diff in the UI.
--
-- New shape for UPDATEs:
--   { field: { "old": <old_value>, "new": <new_value> } }
--
-- INSERT/DELETE shapes are unchanged (full row snapshot).
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pharmacy_id uuid;
  v_user_id     uuid;
  v_action      text;
  v_record_id   uuid;
  v_changes     jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_pharmacy_id := OLD.pharmacy_id;
    v_record_id   := OLD.id;
    v_action      := 'delete';
    v_changes     := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    v_pharmacy_id := NEW.pharmacy_id;
    v_record_id   := NEW.id;
    v_action      := 'insert';
    v_changes     := to_jsonb(NEW);
  ELSE
    v_pharmacy_id := NEW.pharmacy_id;
    v_record_id   := NEW.id;
    v_action      := 'update';
    v_changes := (
      SELECT jsonb_object_agg(
        key,
        jsonb_build_object(
          'old', to_jsonb(OLD) -> key,
          'new', to_jsonb(NEW) -> key
        )
      )
      FROM jsonb_each(to_jsonb(NEW))
      WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
    );
    IF v_changes IS NULL OR v_changes = '{}' THEN
      RETURN NEW;
    END IF;
  END IF;

  v_user_id := (
    SELECT id FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );

  INSERT INTO public.audit_logs (pharmacy_id, user_id, action, table_name, record_id, changes)
  VALUES (v_pharmacy_id, v_user_id, v_action, TG_TABLE_NAME, v_record_id, v_changes);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
