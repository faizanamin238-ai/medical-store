-- Fix audit_row_change trigger function
-- The original used `profiles.auth_user_id = auth.uid()` but the column
-- is named `id`, so every INSERT/UPDATE/DELETE to audited tables failed.
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
      SELECT jsonb_object_agg(key, value)
      FROM jsonb_each(to_jsonb(NEW))
      WHERE to_jsonb(NEW) -> key <> to_jsonb(OLD) -> key
    );
    IF v_changes = '{}' THEN
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
