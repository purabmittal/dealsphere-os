import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { ProjectCreateForm } from '@/components/projects/project-create-form';

export default async function ProjectsPage() {
  try {
    await requirePermission('PROJECTS', 'VIEW');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();
  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, status, health, progress, deadline, clients(companies(name))')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, companies(name)'),
  ]);

  const typedProjects = (projects ?? []) as {
    id: string;
    name: string;
    status: string;
    health: 'ON_TRACK' | 'AT_RISK' | 'DELAYED';
    progress: number;
    deadline: string | null;
    clients: { companies: { name: string } | null } | null;
  }[];
  const typedClients = (clients ?? []) as { id: string; companies: { name: string } | null }[];

  const healthColor: Record<string, string> = {
    ON_TRACK: 'bg-success/10 text-success',
    AT_RISK: 'bg-warning/10 text-warning',
    DELAYED: 'bg-danger/10 text-danger',
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-ink-900">Projects</h1>
      <p className="mt-1 text-sm text-ink-500">Active client work and delivery status.</p>

      <ProjectCreateForm clients={typedClients} />

      <div className="mt-6 space-y-2">
        {typedProjects.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-ink-300">
            No projects yet.
          </div>
        )}
        {typedProjects.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-surface-raised p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-ink-900">{p.name}</div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${healthColor[p.health]}`}>
                {p.health.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-1 text-xs text-ink-500">
              {p.clients?.companies?.name ?? 'No client linked'}
              {p.deadline ? ` · due ${new Date(p.deadline).toLocaleDateString()}` : ''}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border">
              <div className="h-1.5 rounded-full bg-accent" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
