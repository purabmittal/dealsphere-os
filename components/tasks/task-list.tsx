'use client';

import { useTransition } from 'react';
import { Check } from 'lucide-react';
import { toggleTaskStatus } from '@/lib/database/tasks-actions';

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  projects: { name: string } | null;
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4 space-y-2">
      {tasks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-ink-300">
          No tasks yet.
        </div>
      )}
      {tasks.map((task) => {
        const done = task.status === 'COMPLETED';
        return (
          <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised p-3">
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  toggleTaskStatus(task.id, task.status);
                })
              }
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                done ? 'border-accent bg-accent text-white' : 'border-border bg-white'
              }`}
              aria-label={done ? 'Mark as not done' : 'Mark as done'}
            >
              {done && <Check size={12} />}
            </button>
            <div className="flex-1">
              <div className={`text-sm ${done ? 'text-ink-300 line-through' : 'text-ink-900'}`}>{task.title}</div>
              <div className="text-xs text-ink-500">
                {task.projects?.name ?? 'No project'}
                {task.due_date ? ` · due ${new Date(task.due_date).toLocaleDateString()}` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
