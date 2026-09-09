-- ============================================================================
-- 0002_auth_helpers.sql
-- Helper functions used inside RLS policies. These are SECURITY DEFINER and
-- STABLE so Postgres can evaluate them cheaply and they bypass RLS themselves
-- (deliberately - they only ever read the caller's own profile/role rows).
-- ============================================================================

-- The organization the currently authenticated user belongs to.
create or replace function auth_organization_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from profiles where id = auth.uid();
$$;

-- All roles held by the currently authenticated user.
create or replace function auth_roles()
returns app_role[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(role), '{}')
  from user_roles
  where profile_id = auth.uid();
$$;

-- True if the current user holds the given role.
create or replace function auth_has_role(check_role app_role)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from user_roles
    where profile_id = auth.uid() and role = check_role
  );
$$;

-- True if the current user's roles grant `check_permission` on `check_module`,
-- resolving an organization-specific override if one exists, otherwise
-- falling back to the system default row for that role/module.
create or replace function auth_has_permission(check_module app_module, check_permission app_permission)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  user_org uuid := auth_organization_id();
  role_row record;
begin
  -- SUPER_ADMIN and ADMIN implicitly have MANAGE on everything.
  if auth_has_role('SUPER_ADMIN') or auth_has_role('ADMIN') then
    return true;
  end if;

  -- For each role the user holds, resolve the effective permission row:
  -- an org-specific override takes priority over the system default row.
  for role_row in
    select ur.role
    from user_roles ur
    where ur.profile_id = auth.uid()
  loop
    if exists (
      select 1
      from (
        select permissions
        from role_permissions
        where role = role_row.role
          and module = check_module
          and organization_id = user_org
        union all
        select permissions
        from role_permissions
        where role = role_row.role
          and module = check_module
          and organization_id is null
          and not exists (
            select 1 from role_permissions
            where role = role_row.role and module = check_module and organization_id = user_org
          )
        limit 1
      ) effective
      where check_permission = any (effective.permissions)
    ) then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

comment on function auth_has_permission is
  'Resolves whether the current user can perform check_permission on check_module, honoring org-level overrides over system defaults.';
