'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { recordAuditEntry } from '@/lib/database/audit';
import type { ActionState } from '@/lib/database/crm-actions';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required.'),
  dueDate: z.string().optional(),
  projectId: z.string().uuid().optional().or(z.literal('')),
});

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = taskSchema.safeParse({
    title: formData.get('title'),
    dueDate: formData.get('dueDate') || undefined,
    projectId: formData.get('projectId') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('TASKS', 'CREATE');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: parsed.data.title,
      due_date: parsed.data.dueDate || null,
      project_id: parsed.data.projectId || null,
      organization_id: actor.organizationId,
      assignee_id: actor.id,
      status: 'TODO',
    })
    .select('id')
    .single();

  if (error) {
    return { error: 'Could not create task.' };
  }

  await recordAuditEntry({
    actor,
    action: `created task "${parsed.data.title}"`,
    entityType: 'task',
    entityId: data?.id,
  });

  revalidatePath('/tasks');
  return { error: null, success: true };
}

export async function toggleTaskStatus(taskId: string, currentStatus: string): Promise<ActionState> {
  const actor = await requirePermission('TASKS', 'EDIT');
  const supabase = createClient();

  const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)
    .eq('organization_id', actor.organizationId);

  if (error) {
    return { error: 'Could not update task.' };
  }

  await recordAuditEntry({
    actor,
    action: `marked task as ${newStatus}`,
    entityType: 'task',
    entityId: taskId,
    previousValue: { status: currentStatus },
    newValue: { status: newStatus },
  });

  revalidatePath('/tasks');
  return { error: null, success: true };
}
