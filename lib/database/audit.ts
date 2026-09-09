import { createClient } from '@/lib/supabase/server';
import type { CurrentUser } from '@/lib/permissions';

interface AuditEntry {
  actor: CurrentUser;
  action: string; // human-readable, e.g. "moved deal to Negotiation"
  entityType: string; // e.g. "deal", "task", "invoice"
  entityId?: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

/**
 * Writes one row to audit_logs. Table-level triggers reject UPDATE/DELETE,
 * so every call here is permanent - only call this after a change has
 * actually been committed, with the real before/after values.
 */
export async function recordAuditEntry(entry: AuditEntry): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('audit_logs').insert({
    organization_id: entry.actor.organizationId,
    actor_id: entry.actor.id,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    previous_value: entry.previousValue ?? null,
    new_value: entry.newValue ?? null,
  });

  if (error) {
    // Audit logging failing silently would defeat its purpose, but it also
    // should not take down the user-facing action that triggered it -
    // surface loudly to server logs for alerting instead.
    console.error('Failed to write audit log entry:', error, entry);
  }
}
