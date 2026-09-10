import { createClient } from '@/lib/supabase/server';
import type { AppModule, AppPermission, AppRole } from '@/types/database.types';

export interface CurrentUser {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  roles: AppRole[];
}

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
  const typedRoleRows = (roleRows ?? []) as { role: AppRole }[];

  return {
    id: profile.id,
    organizationId: profile.organization_id,
    fullName: profile.full_name,
    email: profile.email,
    roles: typedRoleRows.map((r) => r.role),
  };
}

export async function hasPermission(module: AppModule, permission: AppPermission): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('auth_has_permission', {
    check_module: module,
    check_permission: permission,
  });

  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }

  return Boolean(data);
}

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
