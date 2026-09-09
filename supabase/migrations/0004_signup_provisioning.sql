-- ============================================================================
-- 0004_signup_provisioning.sql
-- When a new user completes Supabase Auth signup, provision their tenant.
--
-- Two signup paths are supported, distinguished by auth.users.raw_user_meta_data:
--   1. { "signup_type": "new_organization", "organization_name": "..." }
--      -> creates a brand new organization, makes this user SUPER_ADMIN.
--   2. { "signup_type": "invite", "organization_id": "...", "role": "..." }
--      -> attaches the user to an existing organization with the given role.
--         (Invite creation itself is Phase 3+ scope; this trigger just
--         handles the acceptance side so the schema is ready for it now.)
-- ============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := new.raw_user_meta_data;
  signup_type text := meta ->> 'signup_type';
  target_org_id uuid;
  assigned_role app_role;
  org_name text;
  org_slug text;
begin
  if signup_type = 'invite' then
    target_org_id := (meta ->> 'organization_id')::uuid;
    assigned_role := coalesce((meta ->> 'role')::app_role, 'MEMBER');

    if target_org_id is null then
      raise exception 'Invite signup is missing organization_id in user metadata';
    end if;
  else
    -- Default path: a brand-new organization owned by this user.
    org_name := coalesce(meta ->> 'organization_name', split_part(new.email, '@', 2));
    org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 8);

    insert into organizations (name, slug)
    values (org_name, org_slug)
    returning id into target_org_id;

    assigned_role := 'SUPER_ADMIN';
  end if;

  insert into profiles (id, organization_id, full_name, email)
  values (
    new.id,
    target_org_id,
    coalesce(meta ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );

  insert into user_roles (organization_id, profile_id, role)
  values (target_org_id, new.id, assigned_role);

  return new;
end;
$$;

-- Fires after Supabase Auth creates the user record.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
