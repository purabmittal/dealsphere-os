import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';

export default async function ClientsPage() {
  try {
    await requirePermission('CLIENTS', 'VIEW');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();
  const { data: clients } = await supabase
    .from('clients')
    .select('id, status, created_at, companies(name)')
    .order('created_at', { ascending: false });

  const typedClients = (clients ?? []) as {
    id: string;
    status: string;
    created_at: string;
    companies: { name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-ink-900">Clients</h1>
      <p className="mt-1 text-sm text-ink-500">
        Clients are created automatically when a deal is marked WON — no manual entry needed here.
      </p>

      <div className="mt-6 space-y-2">
        {typedClients.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-ink-300">
            No clients yet. Win a deal on the Deals page to create your first one.
          </div>
        )}
        {typedClients.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-4">
            <div>
              <div className="text-sm font-medium text-ink-900">{c.companies?.name ?? 'Unnamed company'}</div>
              <div className="text-xs text-ink-500">Client since {new Date(c.created_at).toLocaleDateString()}</div>
            </div>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
