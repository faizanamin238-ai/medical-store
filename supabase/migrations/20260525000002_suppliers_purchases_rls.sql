-- ============================================================
-- RLS for suppliers
-- ============================================================
alter table public.suppliers enable row level security;

create policy "suppliers_select_own_pharmacy"
  on public.suppliers for select
  using (pharmacy_id = public.get_user_pharmacy_id());

create policy "suppliers_insert_own_pharmacy"
  on public.suppliers for insert
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "suppliers_update_own_pharmacy"
  on public.suppliers for update
  using (pharmacy_id = public.get_user_pharmacy_id())
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "suppliers_delete_managers_only"
  on public.suppliers for delete
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- RLS for purchases
-- ============================================================
alter table public.purchases enable row level security;

create policy "purchases_select_own_pharmacy"
  on public.purchases for select
  using (pharmacy_id = public.get_user_pharmacy_id());

create policy "purchases_insert_own_pharmacy"
  on public.purchases for insert
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "purchases_update_own_pharmacy"
  on public.purchases for update
  using (pharmacy_id = public.get_user_pharmacy_id())
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "purchases_delete_managers_only"
  on public.purchases for delete
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- RLS for purchase_items (scoped through purchases.pharmacy_id)
-- ============================================================
alter table public.purchase_items enable row level security;

create policy "purchase_items_select_own_pharmacy"
  on public.purchase_items for select
  using (
    exists (
      select 1 from public.purchases p
      where p.id = purchase_id
        and p.pharmacy_id = public.get_user_pharmacy_id()
    )
  );

create policy "purchase_items_insert_own_pharmacy"
  on public.purchase_items for insert
  with check (
    exists (
      select 1 from public.purchases p
      where p.id = purchase_id
        and p.pharmacy_id = public.get_user_pharmacy_id()
    )
  );

create policy "purchase_items_update_own_pharmacy"
  on public.purchase_items for update
  using (
    exists (
      select 1 from public.purchases p
      where p.id = purchase_id
        and p.pharmacy_id = public.get_user_pharmacy_id()
    )
  );

create policy "purchase_items_delete_managers_only"
  on public.purchase_items for delete
  using (
    exists (
      select 1 from public.purchases p
      where p.id = purchase_id
        and p.pharmacy_id = public.get_user_pharmacy_id()
    )
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- Atomic RPC: create purchase + items + update stock
-- ============================================================
create or replace function public.create_purchase_with_items(
  p_supplier_id     uuid,
  p_invoice_number  text,
  p_invoice_date    date,
  p_payment_status  text,
  p_paid_amount     numeric,
  p_items           jsonb   -- [{medicine_id, quantity, unit_cost, total_cost}]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pharmacy_id uuid;
  v_purchase_id uuid;
  v_total       numeric := 0;
  v_item        jsonb;
begin
  -- resolve the caller's pharmacy
  v_pharmacy_id := public.get_user_pharmacy_id();
  if v_pharmacy_id is null then
    raise exception 'Pharmacy not found for current user';
  end if;

  -- compute total from items
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_total := v_total + (v_item->>'total_cost')::numeric;
  end loop;

  -- insert purchase header
  insert into public.purchases (
    pharmacy_id, supplier_id, invoice_number, invoice_date,
    total_amount, paid_amount, payment_status, created_by
  ) values (
    v_pharmacy_id, p_supplier_id, p_invoice_number, p_invoice_date,
    v_total, p_paid_amount, p_payment_status, auth.uid()
  )
  returning id into v_purchase_id;

  -- insert items and update stock
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.purchase_items (
      purchase_id, medicine_id, quantity, unit_cost, total_cost
    ) values (
      v_purchase_id,
      (v_item->>'medicine_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_cost')::numeric,
      (v_item->>'total_cost')::numeric
    );

    -- increment medicine stock atomically
    update public.medicines
    set stock_quantity = stock_quantity + (v_item->>'quantity')::integer,
        updated_at = now()
    where id = (v_item->>'medicine_id')::uuid
      and pharmacy_id = v_pharmacy_id;

    if not found then
      raise exception 'Medicine % not found or does not belong to this pharmacy',
        v_item->>'medicine_id';
    end if;
  end loop;

  return v_purchase_id;
end;
$$;
