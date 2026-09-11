'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { recordAuditEntry } from '@/lib/database/audit';
import type { ActionState } from '@/lib/database/crm-actions';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  clientId: z.string().uuid().optional().or(z.literal('')),
  deadline: z.string().optional(),
});

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    name: formData.get('name'),
    clientId: formData.get('clientId') || undefined,
    deadline: formData.get('deadline') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('PROJECTS', 'CREATE');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: parsed.data.name,
      client_id: parsed.data.clientId || null,
      deadline: parsed.data.deadline || null,
      organization_id: actor.organizationId,
      project_manager_id: actor.id,
      status: 'ACTIVE',
      health: 'ON_TRACK',
    })
    .select('id')
    .single();

  if (error) {
    return { error: 'Could not create project.' };
  }

  await recordAuditEntry({
    actor,
    action: `created project "${parsed.data.name}"`,
    entityType: 'project',
    entityId: data?.id,
  });

  revalidatePath('/projects');
  return { error: null, success: true };
}
