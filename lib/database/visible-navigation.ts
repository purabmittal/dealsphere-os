import { createClient } from '@/lib/supabase/server';
import { NAV_GROUPS, type NavGroup } from '@/lib/database/navigation';
import type { AppRole } from '@/types/database.types';

/**
 * Filters NAV_GROUPS down to items the current user actually has VIEW on.
 * Runs a single query for all of the user's roles' VIEW grants rather than
 * one RPC call per nav item, since the sidebar renders on every page.
 */
export async function getVisibleNavGroups(roles: AppRole[]): Promise<NavGroup[]> {
  const supabase = createClient();

  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
    return NAV_GROUPS; // admins see everything, matching auth_has_permission()
  }

  const { data: grants } = await supabase
    .from('role_permissions')
    .select('module, permissions')
    .in('role', roles)
    .contains('permissions', ['VIEW']);

  const viewableModules = new Set((grants ?? []).map((g) => g.module));

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.module === null || viewableModules.has(item.module)),
  })).filter((group) => group.items.length > 0);
}
