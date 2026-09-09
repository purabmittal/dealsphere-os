-- ============================================================================
-- 0003_rls_policies.sql
-- Row Level Security. Enabled on every tenant table. Default posture is
-- deny-all; each policy below opens one specific, narrow path.
-- ============================================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table role_permissions enable row level security;
alter table audit_logs enable row level security;

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS
-- A user may read only their own organization. Only SUPER_ADMIN/ADMIN may
-- update org settings. Nobody deletes an organization via the client.
-- ----------------------------------------------------------------------------

create policy "org: members can view their own organization"
  on organizations for select
  using (id = auth_organization_id());

create policy "org: admins can update their own organization"
  on organizations for update
  using (id = auth_organization_id() and (auth_has_role('SUPER_ADMIN') or auth_has_role('ADMIN')))
  with check (id = auth_organization_id());

-- Organization creation happens via the signup server action using the
-- service-role client (see lib/auth/signup.ts), never directly from the
-- browser, so no client-facing INSERT policy is defined here.

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------

create policy "profiles: view profiles in own organization"
  on profiles for select
  using (organization_id = auth_organization_id());

create policy "profiles: user can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and organization_id = auth_organization_id());

create policy "profiles: admins can update any profile in their org"
  on profiles for update
  using (organization_id = auth_organization_id() and (auth_has_role('SUPER_ADMIN') or auth_has_role('ADMIN')))
  with check (organization_id = auth_organization_id());

-- ----------------------------------------------------------------------------
-- USER ROLES
-- Only admins manage role assignments. Everyone can see roles within their org
-- (needed to render "assigned to" UI, team directory, etc).
-- ----------------------------------------------------------------------------

create policy "user_roles: view within own organization"
  on user_roles for select
  using (organization_id = auth_organization_id());

create policy "user_roles: admins manage role assignments"
  on user_roles for all
  using (organization_id = auth_organization_id() and (auth_has_role('SUPER_ADMIN') or auth_has_role('ADMIN')))
  with check (organization_id = auth_organization_id());

-- ----------------------------------------------------------------------------
-- ROLE PERMISSIONS
-- System default rows (organization_id is null) are readable by everyone so
-- the client can resolve UI affordances, but never writable by tenants.
-- Org-specific overrides are readable/writable only by admins of that org.
-- ----------------------------------------------------------------------------

create policy "role_permissions: read system defaults"
  on role_permissions for select
  using (organization_id is null);

create policy "role_permissions: read own org overrides"
  on role_permissions for select
  using (organization_id = auth_organization_id());

create policy "role_permissions: admins manage own org overrides"
  on role_permissions for all
  using (organization_id = auth_organization_id() and (auth_has_role('SUPER_ADMIN') or auth_has_role('ADMIN')))
  with check (organization_id = auth_organization_id());

-- ----------------------------------------------------------------------------
-- AUDIT LOGS
-- Readable by admins of the org. Insertable by any authenticated member of
-- the org (server actions write on the user's behalf); never updatable or
-- deletable (enforced additionally by the triggers in migration 0001).
-- ----------------------------------------------------------------------------

create policy "audit_logs: admins can read their org's audit trail"
  on audit_logs for select
  using (organization_id = auth_organization_id() and (auth_has_role('SUPER_ADMIN') or auth_has_role('ADMIN')));

create policy "audit_logs: members can insert entries for their own org"
  on audit_logs for insert
  with check (organization_id = auth_organization_id() and actor_id = auth.uid());
