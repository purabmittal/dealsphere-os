-- ============================================================================
-- 0001_core_foundation.sql
-- DealSphere OS - Phase 1: organizations, profiles, roles, permissions
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

create type app_role as enum (
  'SUPER_ADMIN',
  'ADMIN',
  'SALES',
  'MARKETING',
  'PROJECT_MANAGER',
  'RECRUITMENT',
  'FINANCE',
  'SUPPORT',
  'MEMBER'
);

create type app_permission as enum (
  'VIEW',
  'CREATE',
  'EDIT',
  'DELETE',
  'APPROVE',
  'EXPORT',
  'MANAGE'
);

-- Modules that permissions/roles apply to. Extend this list as new modules ship.
create type app_module as enum (
  'CRM',
  'DEALS',
  'CLIENTS',
  'PROJECTS',
  'TASKS',
  'CALENDAR',
  'COMMUNICATIONS',
  'CONTENT',
  'CAMPAIGNS',
  'CAREERS',
  'TEAM',
  'FINANCE',
  'INVOICES',
  'CONTRACTS',
  'DOCUMENTS',
  'GOALS',
  'ANALYTICS',
  'SUPPORT',
  'KNOWLEDGE',
  'SETTINGS',
  'AI'
);

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS  (multi-tenant root)
-- ----------------------------------------------------------------------------

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  brand_primary_color text default '#0B1E3D',
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table organizations is 'Tenant root. Every business table hangs off organization_id for SaaS isolation.';

-- ----------------------------------------------------------------------------
-- PROFILES  (extends auth.users, 1:1)
-- ----------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  department text,
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_organization_id_idx on profiles (organization_id);
comment on table profiles is 'One row per authenticated user, scoped to a single organization.';

-- ----------------------------------------------------------------------------
-- USER ROLES  (a user can hold more than one role)
-- ----------------------------------------------------------------------------

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (profile_id, role)
);

create index user_roles_profile_id_idx on user_roles (profile_id);
create index user_roles_organization_id_idx on user_roles (organization_id);

-- ----------------------------------------------------------------------------
-- ROLE PERMISSIONS  (role -> module -> allowed permissions)
-- Org-level overrides are supported: a null organization_id row is a system
-- default; an organization can insert its own row for (org, role, module) to
-- override the default.
-- ----------------------------------------------------------------------------

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id) on delete cascade,
  role app_role not null,
  module app_module not null,
  permissions app_permission[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role, module)
);

comment on table role_permissions is 'Defines which permissions a role has per module. organization_id null = system default row.';

-- ----------------------------------------------------------------------------
-- AUDIT LOG  (immutable)
-- ----------------------------------------------------------------------------

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  actor_id uuid references profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_organization_id_idx on audit_logs (organization_id);
create index audit_logs_entity_idx on audit_logs (entity_type, entity_id);

-- Immutability: block UPDATE and DELETE at the database level.
create or replace function reject_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only: % is not permitted', tg_op;
end;
$$;

create trigger audit_logs_no_update
  before update on audit_logs
  for each row execute function reject_audit_log_mutation();

create trigger audit_logs_no_delete
  before delete on audit_logs
  for each row execute function reject_audit_log_mutation();

-- ----------------------------------------------------------------------------
-- updated_at helper, reused by every future migration
-- ----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on organizations
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger role_permissions_set_updated_at
  before update on role_permissions
  for each row execute function set_updated_at();
