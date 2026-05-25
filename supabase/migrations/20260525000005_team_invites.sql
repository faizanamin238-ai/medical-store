-- Phase 7: Team Management
-- Creates pharmacy_invites table and SECURITY DEFINER RPCs for team operations.
-- Intentionally avoids modifying the auth trigger — all team queries go through RPCs.

-- ─── pharmacy_invites ────────────────────────────────────────────────────────

create table if not exists public.pharmacy_invites (
  id           uuid primary key default gen_random_uuid(),
  pharmacy_id  uuid not null references public.pharmacies(id) on delete cascade,
  invited_email text not null,
  role         text not null check (role in ('manager', 'pharmacist', 'cashier')),
  invited_by   uuid references public.profiles(id) on delete set null,
  accepted     boolean not null default false,
  created_at   timestamptz default now()
);

alter table public.pharmacy_invites enable row level security;

create policy "pharmacy_invites_select_own_pharmacy"
  on public.pharmacy_invites for select
  using (pharmacy_id = public.get_user_pharmacy_id());

create policy "pharmacy_invites_insert_owner_only"
  on public.pharmacy_invites for insert
  with check (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

create policy "pharmacy_invites_delete_owner_only"
  on public.pharmacy_invites for delete
  using (
    pharmacy_id = public.get_user_pharmacy_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- ─── list_team_members ───────────────────────────────────────────────────────
-- SECURITY DEFINER bypasses profiles RLS — safe because we always filter
-- by the caller's own pharmacy_id via get_user_pharmacy_id().

create or replace function public.list_team_members()
returns table (
  id          uuid,
  full_name   text,
  role        text,
  created_at  timestamptz
)
language plpgsql security definer stable
as $$
begin
  return query
  select p.id, p.full_name, p.role::text, p.created_at
  from public.profiles p
  where p.pharmacy_id = public.get_user_pharmacy_id()
  order by
    case p.role
      when 'owner'      then 1
      when 'manager'    then 2
      when 'pharmacist' then 3
      when 'cashier'    then 4
      else 5
    end,
    p.created_at;
end;
$$;

-- ─── update_team_member_role ─────────────────────────────────────────────────

create or replace function public.update_team_member_role(
  p_profile_id uuid,
  p_new_role   text
)
returns void
language plpgsql security definer
as $$
declare
  v_caller_role     text;
  v_caller_pharmacy uuid;
  v_target_pharmacy uuid;
begin
  select role::text, pharmacy_id
  into v_caller_role, v_caller_pharmacy
  from public.profiles where id = auth.uid();

  if v_caller_role != 'owner' then
    raise exception 'Only owners can change team member roles.';
  end if;

  if p_profile_id = auth.uid() then
    raise exception 'Cannot change your own role.';
  end if;

  if p_new_role not in ('manager', 'pharmacist', 'cashier') then
    raise exception 'Invalid role. Must be manager, pharmacist, or cashier.';
  end if;

  select pharmacy_id into v_target_pharmacy
  from public.profiles where id = p_profile_id;

  if v_target_pharmacy is null or v_target_pharmacy != v_caller_pharmacy then
    raise exception 'Cannot modify a profile from another pharmacy.';
  end if;

  update public.profiles set role = p_new_role::text where id = p_profile_id;
end;
$$;

-- ─── remove_team_member ──────────────────────────────────────────────────────

create or replace function public.remove_team_member(p_profile_id uuid)
returns void
language plpgsql security definer
as $$
declare
  v_caller_role     text;
  v_caller_pharmacy uuid;
  v_target_pharmacy uuid;
begin
  select role::text, pharmacy_id
  into v_caller_role, v_caller_pharmacy
  from public.profiles where id = auth.uid();

  if v_caller_role != 'owner' then
    raise exception 'Only owners can remove team members.';
  end if;

  if p_profile_id = auth.uid() then
    raise exception 'Cannot remove yourself from the pharmacy.';
  end if;

  select pharmacy_id into v_target_pharmacy
  from public.profiles where id = p_profile_id;

  if v_target_pharmacy is null or v_target_pharmacy != v_caller_pharmacy then
    raise exception 'Cannot modify a profile from another pharmacy.';
  end if;

  update public.profiles
  set pharmacy_id = null, role = null
  where id = p_profile_id;
end;
$$;

-- ─── accept_team_invite ──────────────────────────────────────────────────────
-- Called by an invited user after they authenticate via the invite email link.
-- Looks up their pending invite by email and attaches them to the pharmacy.

create or replace function public.accept_team_invite(p_full_name text default null)
returns text   -- returns the pharmacy name on success
language plpgsql security definer
as $$
declare
  v_invite        record;
  v_email         text;
  v_pharmacy_name text;
begin
  select email into v_email from auth.users where id = auth.uid();

  select * into v_invite
  from public.pharmacy_invites
  where invited_email = v_email and accepted = false
  order by created_at desc
  limit 1;

  if v_invite is null then
    raise exception 'No pending invite found for your email address.';
  end if;

  update public.profiles
  set pharmacy_id = v_invite.pharmacy_id,
      role        = v_invite.role,
      full_name   = coalesce(p_full_name, full_name)
  where id = auth.uid();

  update public.pharmacy_invites
  set accepted = true
  where id = v_invite.id;

  select name into v_pharmacy_name
  from public.pharmacies
  where id = v_invite.pharmacy_id;

  return v_pharmacy_name;
end;
$$;
