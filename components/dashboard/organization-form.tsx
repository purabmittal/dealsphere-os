'use client';

import { useFormState } from 'react-dom';
import { updateOrganization, type ActionState } from '@/lib/database/settings-actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: ActionState = { error: null };

export function OrganizationForm({ initial }: { initial: { name: string; currency: string; timezone: string } }) {
  const [state, formAction] = useFormState(updateOrganization, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-lg border border-border bg-surface-raised p-6">
      <FormField label="Organization name" name="name" defaultValue={initial.name} />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Currency (3-letter code)" name="currency" defaultValue={initial.currency} />
        <FormField label="Timezone" name="timezone" defaultValue={initial.timezone} />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved.</p>}

      <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
    </form>
  );
}
