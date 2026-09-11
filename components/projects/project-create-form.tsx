'use client';

import { useFormState } from 'react-dom';
import { createProject } from '@/lib/database/projects-actions';
import type { ActionState } from '@/lib/database/crm-actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: ActionState = { error: null };

interface Client {
  id: string;
  companies: { name: string } | null;
}

export function ProjectCreateForm({ clients }: { clients: Client[] }) {
  const [state, formAction] = useFormState(createProject, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface-raised p-4 sm:grid-cols-4"
    >
      <FormField label="Project name" name="name" />
      <FormField label="Deadline" name="deadline" type="date" required={false} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Client (optional)</span>
        <select
          name="clientId"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent focus:outline-none"
        >
          <option value="">No client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companies?.name ?? 'Unnamed'}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <SubmitButton pendingLabel="Adding…">Add project</SubmitButton>
      </div>
      {state.error && <p className="sm:col-span-4 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
