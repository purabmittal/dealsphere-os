import { getCurrentUser } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = createClient();

  const [{ count: teamCount }, { data: roleBreakdown }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('organization_id', user.organizationId),
    supabase.from('user_roles').select('role').eq('organization_id', user.organizationId),
  ]);

  const roleCounts = ((roleBreakdown ?? []) as { role: string }[]).reduce<Record<string, number>>((acc, r) => {
    acc[r.role] = (acc[r.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold text-ink-900">Good to see you, {user.fullName.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-ink-500">
        Here's what's live in your workspace today. Business modules (CRM, Deals, Finance, etc.) come online in later
        phases — this dashboard will grow real KPI widgets as each module ships, rather than showing numbers that
        don't back onto real data.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-raised p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-300">Team members</div>
          <div className="mt-1 text-2xl font-semibold text-ink-900">{teamCount ?? 0}</div>
        </div>

        <div className="rounded-lg border border-border bg-surface-raised p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-300">Roles in use</div>
          <ul className="mt-2 space-y-1 text-sm text-ink-700">
            {Object.entries(roleCounts).length === 0 && <li className="text-ink-300">No roles assigned yet.</li>}
            {Object.entries(roleCounts).map(([role, count]) => (
              <li key={role} className="flex justify-between">
                <span>{role.replace('_', ' ')}</span>
                <span className="font-medium text-ink-900">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border p-5 text-sm text-ink-500">
        <span className="font-medium text-ink-700">Next up (Phase 2):</span> CRM, Deals, Clients, Projects, and
        Tasks — the core business lifecycle this dashboard will report on.
      </div>
    </div>
  );
}
