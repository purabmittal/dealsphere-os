'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { recordAuditEntry } from '@/lib/database/audit';

export interface ActionState {
  error: string | null;
  success?: boolean;
}

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required.'),
  industry: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
});

export async function createCompany(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = companySchema.safeParse({
    name: formData.get('name'),
    industry: formData.get('industry') || undefined,
    website: formData.get('website') || undefined,
    location: formData.get('location') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('CRM', 'CREATE');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('companies')
    .insert({ ...parsed.data, organization_id: actor.organizationId, owner_id: actor.id })
    .select('id')
    .single();

  if (error) {
    return { error: 'Could not create company.' };
  }

  await recordAuditEntry({
    actor,
    action: `created company "${parsed.data.name}"`,
    entityType: 'company',
    entityId: data?.id,
    newValue: parsed.data,
  });

  revalidatePath('/crm');
  return { error: null, success: true };
}

const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required.'),
  email: z.string().email('Enter a valid email.').optional().or(z.literal('')),
  phone: z.string().optional(),
  designation: z.string().optional(),
  companyId: z.string().uuid().optional().or(z.literal('')),
});

export async function createContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    designation: formData.get('designation') || undefined,
    companyId: formData.get('companyId') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('CRM', 'CREATE');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      designation: parsed.data.designation || null,
      company_id: parsed.data.companyId || null,
      organization_id: actor.organizationId,
      owner_id: actor.id,
    })
    .select('id')
    .single();

  if (error) {
    return { error: 'Could not create contact.' };
  }

  await recordAuditEntry({
    actor,
    action: `created contact "${parsed.data.name}"`,
    entityType: 'contact',
    entityId: data?.id,
  });

  revalidatePath('/crm');
  return { error: null, success: true };
}

const leadSchema = z.object({
  name: z.string().min(1, 'Lead name is required.'),
  source: z.string().optional(),
  estimatedValue: z.string().optional(),
  companyId: z.string().uuid().optional().or(z.literal('')),
});

export async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = leadSchema.safeParse({
    name: formData.get('name'),
    source: formData.get('source') || undefined,
    estimatedValue: formData.get('estimatedValue') || undefined,
    companyId: formData.get('companyId') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const actor = await requirePermission('CRM', 'CREATE');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: parsed.data.name,
      source: parsed.data.source || null,
      estimated_value: parsed.data.estimatedValue ? Number(parsed.data.estimatedValue) : null,
      company_id: parsed.data.companyId || null,
      organization_id: actor.organizationId,
      owner_id: actor.id,
      status: 'NEW',
    })
    .select('id')
    .single();

  if (error) {
    return { error: 'Could not create lead.' };
  }

  await recordAuditEntry({
    actor,
    action: `created lead "${parsed.data.name}"`,
    entityType: 'lead',
    entityId: data?.id,
  });

  revalidatePath('/crm');
  return { error: null, success: true };
}
