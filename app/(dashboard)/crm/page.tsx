import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { CrmCreateForms } from '@/components/crm/crm-create-forms';

export default async function CrmPage() {
  let actor;
  try {
    actor = await requirePermission('CRM', 'VIEW');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();

  const [{ data: companies }, { data: leads }, { data: contacts }] = await Promise.all([
    supabase.from('companies').select('id, name, industry, status').order('created_at', { ascending: false }),
    supabase
      .from('leads')
      .select('id, name, status, estimated_value, source')
      .order('created_at', { ascending: false }),
    supabase.from('contacts').select('id, name, email, designation').order('created_at', { ascending: false }),
  ]);

  const typedCompanies = (companies ?? []) as { id: string; name: string; industry: string | null; status: string }[];
  const typedLeads = (leads ?? []) as {
    id: string;
    name: string;
    status: string;
    estimated_value: number | null;
    source: string | null;
  }[];
  const typedContacts = (contacts ?? []) as { id: string; name: string; email: string | null; designation: string | null }[];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold text-ink-900">CRM</h1>
      <p className="mt-1 text-sm text-ink-500">Companies, contacts, and leads for your organization.</p>

      <CrmCreateForms companies={typedCompanies} />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section>
          <h2 className="text-sm font-semibold text-ink-900">Companies ({typedCompanies.length})</h2>
          <ul className="mt-2 space-y-2">
            {typedCompanies.length === 0 && <li className="text-sm text-ink-300">No companies yet.</li>}
            {typedCompanies.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-surface-raised p-3">
                <div className="text-sm font-medium text-ink-900">{c.name}</div>
                <div className="text-xs text-ink-500">{c.industry ?? 'No industry set'}</div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-900">Leads ({typedLeads.length})</h2>
          <ul className="mt-2 space-y-2">
            {typedLeads.length === 0 && <li className="text-sm text-ink-300">No leads yet.</li>}
            {typedLeads.map((l) => (
              <li key={l.id} className="rounded-lg border border-border bg-surface-raised p-3">
                <div className="text-sm font-medium text-ink-900">{l.name}</div>
                <div className="text-xs text-ink-500">
                  {l.status} {l.estimated_value ? `· $${l.estimated_value.toLocaleString()}` : ''}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-900">Contacts ({typedContacts.length})</h2>
          <ul className="mt-2 space-y-2">
            {typedContacts.length === 0 && <li className="text-sm text-ink-300">No contacts yet.</li>}
            {typedContacts.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-surface-raised p-3">
                <div className="text-sm font-medium text-ink-900">{c.name}</div>
                <div className="text-xs text-ink-500">{c.designation ?? c.email ?? ''}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
