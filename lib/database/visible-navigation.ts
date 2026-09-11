import { createClient } from '@/lib/supabase/server';
import { NAV_GROUPS, type NavGroup } from '@/lib/database/navigation';
import type { AppRole } from '@/types/database.types';

export async function getVisibleNavGroups(roles: AppRole[]): Promise<NavGroup[]> {
  const supabase = createClient();

  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
    return NAV_GROUPS;
  }

  const { data: grants } = await supabase
    .from('role_permissions')
    .select('module, permissions')
    .in('role', roles)
    .contains('permissions', ['VIEW']);

  const typedGrants = (grants ?? []) as { module: string; permissions: string[] }[];
  const viewableModules = new Set(typedGrants.map((g) => g.module));

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.module === null || viewableModules.has(item.module)),
  })).filter((group) => group.items.length > 0);
}
