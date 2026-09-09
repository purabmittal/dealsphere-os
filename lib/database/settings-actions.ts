'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { recordAuditEntry } from '@/lib/database/audit';
import type { AppRole } from '@/types/database.types';

export interface ActionState {
  error: string | null;
  success?: boolean;
}

const orgSchema = z.object({
  name: z.string().min(1, 'Organization name is required.'),
  currency: z.string().length(3, 'Use a 3-letter currency code, e.g. USD.'),
  timezone: z.string().min(1, 'Timezone is required.'),
});

export async function updateOrganization(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = orgSchema.safeParse({
    name: formData.get('name'),
    currency: formData.get('currency'),
    timezone: formData.get('timezone'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('SETTINGS', 'EDIT');
  const supabase = createClient();

  const { data: before } = await supabase
    .from('organizations')
    .select('name, currency, timezone')
    .eq('id', actor.organizationId)
    .single();

  const { error } = await supabase.from('organizations').update(parsed.data).eq('id', actor.organizationId);

  if (error) {
    return { error: 'Could not update organization settings.' };
  }

  await recordAuditEntry({
    actor,
    action: 'updated organization settings',
    entityType: 'organization',
    entityId: actor.organizationId,
    previousValue: before,
    newValue: parsed.data,
  });

  revalidatePath('/settings/organization');
  return { error: null, success: true };
}

const assignRoleSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN',
    'SALES',
    'MARKETING',
    'PROJECT_MANAGER',
    'RECRUITMENT',
    'FINANCE',
    'SUPPORT',
    'MEMBER',
  ]),
});

export async function assignRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = assignRoleSchema.safeParse({
    profileId: formData.get('profileId'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    return { error: 'Invalid role assignment.' };
  }

  const actor = await requirePermission('SETTINGS', 'MANAGE');
  const supabase = createClient();

  const { error } = await supabase.from('user_roles').insert({
    organization_id: actor.organizationId,
    profile_id: parsed.data.profileId,
    role: parsed.data.role as AppRole,
  });

  if (error) {
    // Most common case: unique (profile_id, role) constraint - they already have this role.
    return { error: error.code === '23505' ? 'That user already has this role.' : 'Could not assign role.' };
  }

  await recordAuditEntry({
    actor,
    action: `assigned role ${parsed.data.role}`,
    entityType: 'user_roles',
    entityId: parsed.data.profileId,
    newValue: { role: parsed.data.role },
  });

  revalidatePath('/settings/team');
  return { error: null, success: true };
}

export async function removeRole(profileId: string, role: AppRole): Promise<ActionState> {
  const actor = await requirePermission('SETTINGS', 'MANAGE');
  const supabase = createClient();

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('profile_id', profileId)
    .eq('role', role)
    .eq('organization_id', actor.organizationId);

  if (error) {
    return { error: 'Could not remove role.' };
  }

  await recordAuditEntry({
    actor,
    action: `removed role ${role}`,
    entityType: 'user_roles',
    entityId: profileId,
    previousValue: { role },
  });

  revalidatePath('/settings/team');
  return { error: null };
}
