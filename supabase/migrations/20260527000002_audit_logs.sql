create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,       -- 'create' | 'update' | 'delete' | 'invite' | 'role_change' | 'export'
  resource    text not null,       -- 'medicine' | 'sale' | 'customer' | 'supplier' | 'team_member' | 'settings'
  resource_id text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_pharmacy_id_idx on public.audit_logs (pharmacy_id, created_at desc);

alter table public.audit_logs enable row level security;

-- any authenticated member of the pharmacy can insert
create policy "audit_logs_insert_own_pharmacy"
  on public.audit_logs for insert
  with check (pharmacy_id = public.get_user_pharmacy_id());

-- only owner/manager can read
create policy "audit_logs_select_managers"
  on public.audit_logs for select
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );
