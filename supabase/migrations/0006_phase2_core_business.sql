-- ============================================================================
-- 0006_phase2_core_business.sql
-- DealSphere OS - Phase 2: CRM, Deals, Clients, Projects, Tasks
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

create type deal_stage as enum (
  'NEW', 'CONTACTED', 'DISCOVERY', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'
);

create type client_status as enum (
  'PROSPECT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE'
);

create type project_health as enum ('ON_TRACK', 'AT_RISK', 'DELAYED');

create type task_status as enum ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');

create type task_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- ----------------------------------------------------------------------------
-- COMPANIES
-- ----------------------------------------------------------------------------

create table companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  industry text,
  website text,
  location text,
  description text,
  company_size text,
  owner_id uuid references profiles (id) on delete set null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_organization_id_idx on companies (organization_id);

-- ----------------------------------------------------------------------------
-- CONTACTS
-- ----------------------------------------------------------------------------

create table contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  company_id uuid references companies (id) on delete set null,
  name text not null,
  email text,
  phone text,
  designation text,
  owner_id uuid references profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_organization_id_idx on contacts (organization_id);
create index contacts_company_id_idx on contacts (company_id);

-- ----------------------------------------------------------------------------
-- LEADS
-- ----------------------------------------------------------------------------

create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  company_id uuid references companies (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  name text not null,
  source text,
  industry text,
  owner_id uuid references profiles (id) on delete set null,
  status text not null default 'NEW',
  priority text not null default 'MEDIUM',
  estimated_value numeric,
  lead_score integer,
  last_contacted_at timestamptz,
  next_followup_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_organization_id_idx on leads (organization_id);

-- ----------------------------------------------------------------------------
-- DEALS
-- ----------------------------------------------------------------------------

create table deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  company_id uuid references companies (id) on delete set null,
  lead_id uuid references leads (id) on delete set null,
  owner_id uuid references profiles (id) on delete set null,
  title text not null,
  value numeric,
  probability integer,
  partnership_percentage numeric,
  expected_close_date date,
  stage deal_stage not null default 'NEW',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_organization_id_idx on deals (organization_id);
create index deals_stage_idx on deals (stage);

-- ----------------------------------------------------------------------------
-- CLIENTS  (created when a deal is WON)
-- ----------------------------------------------------------------------------

create table clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  company_id uuid references companies (id) on delete set null,
  deal_id uuid references deals (id) on delete set null,
  status client_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_organization_id_idx on clients (organization_id);

-- ----------------------------------------------------------------------------
-- PROJECTS
-- ----------------------------------------------------------------------------

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  client_id uuid references clients (id) on delete set null,
  name text not null,
  project_manager_id uuid references profiles (id) on delete set null,
  description text,
  priority text not null default 'MEDIUM',
  status text not null default 'ACTIVE',
  start_date date,
  deadline date,
  progress integer not null default 0,
  budget numeric,
  health project_health not null default 'ON_TRACK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_organization_id_idx on projects (organization_id);

-- ----------------------------------------------------------------------------
-- TASKS
-- ----------------------------------------------------------------------------

create table tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  project_id uuid references projects (id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references profiles (id) on delete set null,
  status task_status not null default 'TODO',
  priority task_priority not null default 'MEDIUM',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_organization_id_idx on tasks (organization_id);
create index tasks_project_id_idx on tasks (project_id);
create index tasks_assignee_id_idx on tasks (assignee_id);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------

create trigger companies_set_updated_at before update on companies for each row execute function set_updated_at();
create trigger contacts_set_updated_at before update on contacts for each row execute function set_updated_at();
create trigger leads_set_updated_at before update on leads for each row execute function set_updated_at();
create trigger deals_set_updated_at before update on deals for each row execute function set_updated_at();
create trigger clients_set_updated_at before update on clients for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks for each row execute function set_updated_at();
