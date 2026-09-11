'use client';

import { useFormState } from 'react-dom';
import { createDeal } from '@/lib/database/deals-actions';
import type { ActionState } from '@/lib/database/crm-actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: ActionState = { error: null };

export function DealCreateForm({ companies }: { companies: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createDeal, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface-raised p-4 sm:grid-cols-4"
    >
      <FormField label="Deal title" name="title" />
      <FormField label="Value ($)" name="value" type="number" required={false} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Company (optional)</span>
        <select
          name="companyId"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent focus:outline-none"
        >
          <option value="">No company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <SubmitButton pendingLabel="Adding…">Add deal</SubmitButton>
      </div>
      {state.error && <p className="sm:col-span-4 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
