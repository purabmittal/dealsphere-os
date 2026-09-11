import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { TaskCreateForm } from '@/components/tasks/task-create-form';
import { TaskList } from '@/components/tasks/task-list';

export default async function TasksPage() {
  try {
    await requirePermission('TASKS', 'VIEW');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();
  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, status, due_date, projects(name)')
      .order('created_at', { ascending: false }),
    supabase.from('projects').select('id, name'),
  ]);

  const typedTasks = (tasks ?? []) as unknown as {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    projects: { name: string } | null;
  }[];
  const typedProjects = (projects ?? []) as { id: string; name: string }[];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-ink-900">Tasks</h1>
      <p className="mt-1 text-sm text-ink-500">Your team's to-do list, optionally linked to a project.</p>

      <TaskCreateForm projects={typedProjects} />
      <TaskList tasks={typedTasks} />
    </div>
  );
}
