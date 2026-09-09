import { createClient } from '@/lib/supabase/server';
import type { AppModule, AppPermission, AppRole } from '@/types/database.types';

export interface CurrentUser {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  roles: AppRole[];
}

/**
 * Loads the authenticated user's profile + roles. Returns null if there is
 * no session. This is the one place app code should go to answer
 * "who is logged in and what can they do" - do not read auth.users directly
 * elsewhere.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, organization_id, full_name, email')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const { data: roleRows } = await supabase.from('user_roles').select('role').eq('profile_id', user.id);

  return {
    id: profile.id,
    organizationId: profile.organization_id,
    fullName: profile.full_name,
    email: profile.email,
    roles: (roleRows ?? []).map((r) => r.role),
  };
}

/**
 * Delegates to the `auth_has_permission` Postgres function so the exact same
 * rule set governs both the RLS policies and any conditional UI/server-action
 * checks - there is no second, driftable copy of the permission matrix in
 * application code.
 */
export async function hasPermission(module: AppModule, permission: AppPermission): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('auth_has_permission', {
    check_module: module,
    check_permission: permission,
  });

  if (error) {
    console.error('Permission check failed:', error);
    return false; // fail closed
  }

  return Boolean(data);
}

/**
 * Throws if the current user lacks the given permission. Use at the top of
 * Server Actions and Route Handlers that mutate data, so an unauthorized
 * request never reaches business logic - RLS is the last line of defense,
 * not the only one.
 */
export async function requirePermission(module: AppModule, permission: AppPermission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new PermissionError('Not authenticated.');
  }

  const allowed = await hasPermission(module, permission);
  if (!allowed) {
    throw new PermissionError(`Missing ${permission} permission on ${module}.`);
  }

  return user;
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}
