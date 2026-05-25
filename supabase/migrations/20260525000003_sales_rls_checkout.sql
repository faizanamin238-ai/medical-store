-- ============================================================
-- RLS for sales
-- ============================================================
alter table public.sales enable row level security;

create policy "sales_select_own_pharmacy"
  on public.sales for select
  using (pharmacy_id = public.get_user_pharmacy_id());

create policy "sales_insert_own_pharmacy"
  on public.sales for insert
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "sales_update_own_pharmacy"
  on public.sales for update
  using (pharmacy_id = public.get_user_pharmacy_id())
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "sales_delete_managers_only"
  on public.sales for delete
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- RLS for sale_items (scoped through sales.pharmacy_id)
-- ============================================================
alter table public.sale_items enable row level security;

create policy "sale_items_select_own_pharmacy"
  on public.sale_items for select
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and s.pharmacy_id = public.get_user_pharmacy_id()
    )
  );

create policy "sale_items_insert_own_pharmacy"
  on public.sale_items for insert
  with check (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and s.pharmacy_id = public.get_user_pharmacy_id()
    )
  );

create policy "sale_items_delete_managers_only"
  on public.sale_items for delete
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and s.pharmacy_id = public.get_user_pharmacy_id()
    )
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- Atomic RPC: checkout sale — decrement stock + insert sale + items
-- ============================================================
create or replace function public.checkout_sale(
  p_customer_id    uuid,
  p_payment_method text,
  p_discount       numeric,
  p_tax            numeric,
  p_items          jsonb  -- [{medicine_id, quantity, unit_price, discount, total}]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pharmacy_id uuid;
  v_sale_id     uuid;
  v_subtotal    numeric := 0;
  v_total       numeric;
  v_item        jsonb;
  v_current_stock integer;
  v_qty         integer;
begin
  v_pharmacy_id := public.get_user_pharmacy_id();
  if v_pharmacy_id is null then
    raise exception 'Pharmacy not found for current user';
  end if;

  -- validate stock and compute subtotal
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;

    select stock_quantity into v_current_stock
    from public.medicines
    where id = (v_item->>'medicine_id')::uuid
      and pharmacy_id = v_pharmacy_id
      and deleted_at is null;

    if not found then
      raise exception 'Medicine % not found', v_item->>'medicine_id';
    end if;

    if v_current_stock < v_qty then
      raise exception 'Insufficient stock for medicine %. Available: %, Requested: %',
        v_item->>'medicine_id', v_current_stock, v_qty;
    end if;

    v_subtotal := v_subtotal + (v_item->>'total')::numeric;
  end loop;

  v_total := v_subtotal - p_discount + p_tax;

  -- insert sale header
  insert into public.sales (
    pharmacy_id, customer_id, payment_method,
    subtotal, discount, tax, total, cashier_id
  ) values (
    v_pharmacy_id, p_customer_id, p_payment_method,
    v_subtotal, p_discount, p_tax, v_total, auth.uid()
  )
  returning id into v_sale_id;

  -- insert items and decrement stock atomically
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;

    insert into public.sale_items (
      sale_id, medicine_id, quantity, unit_price, discount, total
    ) values (
      v_sale_id,
      (v_item->>'medicine_id')::uuid,
      v_qty,
      (v_item->>'unit_price')::numeric,
      coalesce((v_item->>'discount')::numeric, 0),
      (v_item->>'total')::numeric
    );

    update public.medicines
    set stock_quantity = stock_quantity - v_qty,
        updated_at = now()
    where id = (v_item->>'medicine_id')::uuid
      and pharmacy_id = v_pharmacy_id;
  end loop;

  return v_sale_id;
end;
$$;
