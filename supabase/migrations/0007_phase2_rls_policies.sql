-- ============================================================================
-- 0007_phase2_rls_policies.sql
-- Row Level Security for Phase 2 tables. Same pattern as Phase 1: every read
-- is scoped to the caller's organization; every write additionally checks
-- the caller's permission on the relevant module via auth_has_permission().
-- ============================================================================

alter table companies enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

-- ----------------------------------------------------------------------------
-- COMPANIES / CONTACTS / LEADS  (module: CRM)
-- ----------------------------------------------------------------------------

create policy "companies: view within org" on companies for select
  using (organization_id = auth_organization_id());
create policy "companies: create with permission" on companies for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('CRM', 'CREATE'));
create policy "companies: edit with permission" on companies for update
  using (organization_id = auth_organization_id() and auth_has_permission('CRM', 'EDIT'))
  with check (organization_id = auth_organization_id());
create policy "companies: delete with permission" on companies for delete
  using (organization_id = auth_organization_id() and auth_has_permission('CRM', 'DELETE'));

create policy "contacts: view within org" on contacts for select
  using (organization_id = auth_organization_id());
create policy "contacts: create with permission" on contacts for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('CRM', 'CREATE'));
create policy "contacts: edit with permission" on contacts for update
  using (organization_id = auth_organization_id() and auth_has_permission('CRM', 'EDIT'))
  with check (organization_id = auth_organization_id());
create policy "contacts: delete with permission" on contacts for delete
  using (organization_id = auth_organization_id() and auth_has_permission('CRM', 'DELETE'));

create policy "leads: view within org" on leads for select
  using (organization_id = auth_organization_id());
create policy "leads: create with permission" on leads for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('CRM', 'CREATE'));
create policy "leads: edit with permission" on leads for update
  using (organization_id = auth_organization_id() and auth_has_permission('CRM', 'EDIT'))
  with check (organization_id = auth_organization_id());
create policy "leads: delete with permission" on leads for delete
  using (organization_id = auth_organization_id() and auth_has_permission('CRM', 'DELETE'));

-- ----------------------------------------------------------------------------
-- DEALS  (module: DEALS)
-- ----------------------------------------------------------------------------

create policy "deals: view within org" on deals for select
  using (organization_id = auth_organization_id());
create policy "deals: create with permission" on deals for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('DEALS', 'CREATE'));
create policy "deals: edit with permission" on deals for update
  using (organization_id = auth_organization_id() and auth_has_permission('DEALS', 'EDIT'))
  with check (organization_id = auth_organization_id());
create policy "deals: delete with permission" on deals for delete
  using (organization_id = auth_organization_id() and auth_has_permission('DEALS', 'DELETE'));

-- ----------------------------------------------------------------------------
-- CLIENTS  (module: CLIENTS)
-- ----------------------------------------------------------------------------

create policy "clients: view within org" on clients for select
  using (organization_id = auth_organization_id());
create policy "clients: create with permission" on clients for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('DEALS', 'EDIT'));
create policy "clients: edit with permission" on clients for update
  using (organization_id = auth_organization_id() and auth_has_permission('CLIENTS', 'EDIT'))
  with check (organization_id = auth_organization_id());

-- ----------------------------------------------------------------------------
-- PROJECTS  (module: PROJECTS)
-- ----------------------------------------------------------------------------

create policy "projects: view within org" on projects for select
  using (organization_id = auth_organization_id());
create policy "projects: create with permission" on projects for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('PROJECTS', 'CREATE'));
create policy "projects: edit with permission" on projects for update
  using (organization_id = auth_organization_id() and auth_has_permission('PROJECTS', 'EDIT'))
  with check (organization_id = auth_organization_id());
create policy "projects: delete with permission" on projects for delete
  using (organization_id = auth_organization_id() and auth_has_permission('PROJECTS', 'DELETE'));

-- ----------------------------------------------------------------------------
-- TASKS  (module: TASKS)
-- ----------------------------------------------------------------------------

create policy "tasks: view within org" on tasks for select
  using (organization_id = auth_organization_id());
create policy "tasks: create with permission" on tasks for insert
  with check (organization_id = auth_organization_id() and auth_has_permission('TASKS', 'CREATE'));
create policy "tasks: edit with permission" on tasks for update
  using (organization_id = auth_organization_id() and auth_has_permission('TASKS', 'EDIT'))
  with check (organization_id = auth_organization_id());
create policy "tasks: delete with permission" on tasks for delete
  using (organization_id = auth_organization_id() and auth_has_permission('TASKS', 'DELETE'));
