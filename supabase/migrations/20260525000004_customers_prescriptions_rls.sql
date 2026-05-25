-- ============================================================
-- RLS for customers
-- ============================================================
alter table public.customers enable row level security;

create policy "customers_select_own_pharmacy"
  on public.customers for select
  using (pharmacy_id = public.get_user_pharmacy_id());

create policy "customers_insert_own_pharmacy"
  on public.customers for insert
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "customers_update_own_pharmacy"
  on public.customers for update
  using (pharmacy_id = public.get_user_pharmacy_id())
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "customers_delete_managers_only"
  on public.customers for delete
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- RLS for prescriptions
-- ============================================================
alter table public.prescriptions enable row level security;

create policy "prescriptions_select_own_pharmacy"
  on public.prescriptions for select
  using (pharmacy_id = public.get_user_pharmacy_id());

create policy "prescriptions_insert_own_pharmacy"
  on public.prescriptions for insert
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "prescriptions_update_own_pharmacy"
  on public.prescriptions for update
  using (pharmacy_id = public.get_user_pharmacy_id())
  with check (pharmacy_id = public.get_user_pharmacy_id());

create policy "prescriptions_delete_managers_only"
  on public.prescriptions for delete
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ============================================================
-- Storage bucket for prescription images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do nothing;

-- Only authenticated users in the same pharmacy can upload
create policy "prescriptions_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'prescriptions'
    and auth.role() = 'authenticated'
  );

create policy "prescriptions_storage_select"
  on storage.objects for select
  using (
    bucket_id = 'prescriptions'
    and auth.role() = 'authenticated'
  );

create policy "prescriptions_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'prescriptions'
    and auth.role() = 'authenticated'
  );
