-- =============================================
-- Admin Security Hardening
-- Date: 2026-03-14
-- =============================================

-- 1) Central role table (replace localStorage-based role mapping)
create table if not exists public.admin_user_roles (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    role text not null check (lower(role) in ('super_admin', 'admin', 'viewer')),
    org_name text null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists idx_admin_user_roles_email_unique
    on public.admin_user_roles (lower(email));

create index if not exists idx_admin_user_roles_role_active
    on public.admin_user_roles (role, is_active);

create or replace function public.set_updated_at_admin_user_roles()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists trg_admin_user_roles_updated_at on public.admin_user_roles;
create trigger trg_admin_user_roles_updated_at
before update on public.admin_user_roles
for each row
execute function public.set_updated_at_admin_user_roles();

alter table public.admin_user_roles enable row level security;

-- 2) Helper auth functions for consistent RLS checks
create or replace function public.requester_email()
returns text
language sql
stable
as $$
    select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.requester_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (
            select lower(aur.role)
            from public.admin_user_roles aur
            where lower(aur.email) = public.requester_email()
              and aur.is_active = true
            limit 1
        ),
        ''
    );
$$;

create or replace function public.requester_org()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select (
        select aur.org_name
        from public.admin_user_roles aur
        where lower(aur.email) = public.requester_email()
          and aur.is_active = true
        limit 1
    );
$$;

create or replace function public.requester_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.requester_role() in ('super_admin', 'admin');
$$;

-- 3) Role table policies

drop policy if exists "Users can read own role" on public.admin_user_roles;
drop policy if exists "Admins can read role table" on public.admin_user_roles;
drop policy if exists "Super admin can manage roles" on public.admin_user_roles;
drop policy if exists "Admin can manage viewers" on public.admin_user_roles;

create policy "Users can read own role"
on public.admin_user_roles
for select
to authenticated
using (lower(email) = public.requester_email());

create policy "Admins can read role table"
on public.admin_user_roles
for select
to authenticated
using (public.requester_is_admin());

create policy "Super admin can manage roles"
on public.admin_user_roles
for all
to authenticated
using (public.requester_role() = 'super_admin')
with check (public.requester_role() = 'super_admin');

create policy "Admin can manage viewers"
on public.admin_user_roles
for all
to authenticated
using (
    public.requester_role() = 'admin'
    and lower(role) = 'viewer'
)
with check (
    public.requester_role() = 'admin'
    and lower(role) = 'viewer'
);

-- 4) Harden business tables with role-aware policies
alter table public.organizations enable row level security;
alter table public.survey_forms enable row level security;
alter table public.org_form_links enable row level security;
-- system_settings is optional – only enable RLS if the table exists
do $$ begin
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'system_settings') then
        execute 'alter table public.system_settings enable row level security';
    end if;
end $$;
alter table public.survey_responses enable row level security;
alter table public.hrd_ch1_responses enable row level security;

-- Existing broad policies (drop before re-creating)
drop policy if exists "Admin can read all" on public.survey_responses;
drop policy if exists "Admin can delete" on public.survey_responses;
drop policy if exists "Admin can read all hrd" on public.hrd_ch1_responses;
drop policy if exists "Admin can delete hrd" on public.hrd_ch1_responses;
drop policy if exists "Enable read access for authenticated users only" on public.hrd_ch1_responses;
drop policy if exists "Enable update for authenticated users" on public.hrd_ch1_responses;

create policy "Role-aware select survey"
on public.survey_responses
for select
to authenticated
using (
    public.requester_is_admin()
    or (
        public.requester_role() = 'viewer'
        and coalesce(raw_responses ->> 'organization', '') = coalesce(public.requester_org(), '__none__')
    )
);

create policy "Role-aware delete survey"
on public.survey_responses
for delete
to authenticated
using (public.requester_is_admin());

create policy "Role-aware select ch1"
on public.hrd_ch1_responses
for select
to authenticated
using (
    public.requester_is_admin()
    or (
        public.requester_role() = 'viewer'
        and coalesce(organization, '') = coalesce(public.requester_org(), '__none__')
    )
);

create policy "Role-aware delete ch1"
on public.hrd_ch1_responses
for delete
to authenticated
using (public.requester_is_admin());

create policy "Role-aware update ch1"
on public.hrd_ch1_responses
for update
to authenticated
using (public.requester_is_admin())
with check (public.requester_is_admin());

-- Organizations
create policy "Read organizations authenticated"
on public.organizations
for select
to authenticated
using (true);

create policy "Manage organizations admins"
on public.organizations
for all
to authenticated
using (public.requester_is_admin())
with check (public.requester_is_admin());

-- Survey forms
create policy "Read survey forms authenticated"
on public.survey_forms
for select
to authenticated
using (true);

create policy "Manage survey forms admins"
on public.survey_forms
for all
to authenticated
using (public.requester_is_admin())
with check (public.requester_is_admin());

-- Org links
create policy "Read org links authenticated"
on public.org_form_links
for select
to authenticated
using (true);

create policy "Manage org links admins"
on public.org_form_links
for all
to authenticated
using (public.requester_is_admin())
with check (public.requester_is_admin());

-- System settings restricted to super admin only (skip if table doesn't exist)
do $$ begin
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'system_settings') then
        execute $policy$
            create policy "Read system settings super admin"
            on public.system_settings
            for select
            to authenticated
            using (public.requester_role() = 'super_admin')
        $policy$;
        execute $policy$
            create policy "Manage system settings super admin"
            on public.system_settings
            for all
            to authenticated
            using (public.requester_role() = 'super_admin')
            with check (public.requester_role() = 'super_admin')
        $policy$;
    end if;
end $$;

-- 5) Storage hardening: keep upload for respondents, lock down read/write/delete

drop policy if exists "Anyone can upload HRD documents" on storage.objects;
drop policy if exists "Anyone can view HRD documents" on storage.objects;
drop policy if exists "Anyone can update HRD documents" on storage.objects;
drop policy if exists "Anyone can delete HRD documents" on storage.objects;
drop policy if exists "Admin can delete HRD documents" on storage.objects;

create policy "Respondents can upload HRD documents"
on storage.objects
for insert
to anon, authenticated
with check (
    bucket_id = 'hrd-documents'
    and lower(storage.extension(name)) = 'pdf'
);

create policy "Admins can read HRD documents"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'hrd-documents'
    and public.requester_is_admin()
);

create policy "Admins can update HRD documents"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'hrd-documents'
    and public.requester_is_admin()
)
with check (
    bucket_id = 'hrd-documents'
    and public.requester_is_admin()
);

create policy "Admins can delete HRD documents"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'hrd-documents'
    and public.requester_is_admin()
);

-- 6) Minimal audit log table (for future integration)
create table if not exists public.admin_audit_logs (
    id bigint generated always as identity primary key,
    actor_email text,
    actor_role text,
    action text not null,
    target text,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created_at
    on public.admin_audit_logs (created_at desc);

alter table public.admin_audit_logs enable row level security;

create policy "Admins can read audit logs"
on public.admin_audit_logs
for select
to authenticated
using (public.requester_is_admin());

create policy "System can write audit logs"
on public.admin_audit_logs
for insert
to authenticated
with check (public.requester_is_admin());
