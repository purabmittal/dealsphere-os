'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { recordAuditEntry } from '@/lib/database/audit';
import type { ActionState } from '@/lib/database/crm-actions';

const DEAL_STAGES = ['NEW', 'CONTACTED', 'DISCOVERY', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

const dealSchema = z.object({
  title: z.string().min(1, 'Deal title is required.'),
  value: z.string().optional(),
  companyId: z.string().uuid().optional().or(z.literal('')),
});

export async function createDeal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = dealSchema.safeParse({
    title: formData.get('title'),
    value: formData.get('value') || undefined,
    companyId: formData.get('companyId') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('DEALS', 'CREATE');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('deals')
    .insert({
      title: parsed.data.title,
      value: parsed.data.value ? Number(parsed.data.value) : null,
      company_id: parsed.data.companyId || null,
      organization_id: actor.organizationId,
      owner_id: actor.id,
      stage: 'NEW',
    })
    .select('id')
    .single();

  if (error) {
    return { error: 'Could not create deal.' };
  }

  await recordAuditEntry({
    actor,
    action: `created deal "${parsed.data.title}"`,
    entityType: 'deal',
    entityId: data?.id,
  });

  revalidatePath('/deals');
  return { error: null, success: true };
}

/**
 * Moves a deal to a new stage. If the new stage is WON, this also
 * automatically creates a client record linked to the deal - implementing
 * the "Deal won -> create client" automation from the master spec, at the
 * level Phase 2 supports (project + team assignment come with Phase 3+
 * automation engine).
 */
export async function updateDealStage(dealId: string, newStage: (typeof DEAL_STAGES)[number]): Promise<ActionState> {
  const actor = await requirePermission('DEALS', 'EDIT');
  const supabase = createClient();

  const { data: before } = await supabase.from('deals').select('stage, title, company_id').eq('id', dealId).single();

  const { error } = await supabase
    .from('deals')
    .update({ stage: newStage })
    .eq('id', dealId)
    .eq('organization_id', actor.organizationId);

  if (error) {
    return { error: 'Could not update deal stage.' };
  }

  await recordAuditEntry({
    actor,
    action: `moved deal to ${newStage}`,
    entityType: 'deal',
    entityId: dealId,
    previousValue: before,
    newValue: { stage: newStage },
  });

  if (newStage === 'WON' && before) {
    const typedBefore = before as { company_id: string | null };
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('deal_id', dealId)
      .maybeSingle();

    if (!existingClient) {
      const { data: client } = await supabase
        .from('clients')
        .insert({
          organization_id: actor.organizationId,
          company_id: typedBefore.company_id,
          deal_id: dealId,
          status: 'ACTIVE',
        })
        .select('id')
        .single();

      await recordAuditEntry({
        actor,
        action: 'auto-created client from won deal',
        entityType: 'client',
        entityId: client?.id,
      });

      revalidatePath('/clients');
    }
  }

  revalidatePath('/deals');
  return { error: null, success: true };
}
