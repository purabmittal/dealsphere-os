'use client';

import { useFormState } from 'react-dom';
import { createTask } from '@/lib/database/tasks-actions';
import type { ActionState } from '@/lib/database/crm-actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: ActionState = { error: null };

export function TaskCreateForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createTask, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface-raised p-4 sm:grid-cols-4"
    >
      <FormField label="Task title" name="title" />
      <FormField label="Due date" name="dueDate" type="date" required={false} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Project (optional)</span>
        <select
          name="projectId"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent focus:outline-none"
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <SubmitButton pendingLabel="Adding…">Add task</SubmitButton>
      </div>
      {state.error && <p className="sm:col-span-4 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
