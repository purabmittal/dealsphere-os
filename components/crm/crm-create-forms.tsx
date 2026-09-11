'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createCompany, createContact, createLead, type ActionState } from '@/lib/database/crm-actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: ActionState = { error: null };

interface Company {
  id: string;
  name: string;
}

export function CrmCreateForms({ companies }: { companies: Company[] }) {
  const [tab, setTab] = useState<'company' | 'contact' | 'lead'>('company');

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-raised p-4">
      <div className="flex gap-1 border-b border-border pb-3">
        {(['company', 'contact', 'lead'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
              tab === t ? 'bg-accent-soft text-accent' : 'text-ink-500 hover:bg-surface'
            }`}
          >
            + {t}
          </button>
        ))}
      </div>

      <div className="pt-3">
        {tab === 'company' && <CompanyForm />}
        {tab === 'contact' && <ContactForm companies={companies} />}
        {tab === 'lead' && <LeadForm companies={companies} />}
      </div>
    </div>
  );
}

function CompanyForm() {
  const [state, formAction] = useFormState(createCompany, initialState);
  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField label="Company name" name="name" />
      <FormField label="Industry" name="industry" required={false} />
      <FormField label="Website" name="website" required={false} />
      <FormField label="Location" name="location" required={false} />
      {state.error && <p className="sm:col-span-2 text-sm text-danger">{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="Adding…">Add company</SubmitButton>
      </div>
    </form>
  );
}

function ContactForm({ companies }: { companies: Company[] }) {
  const [state, formAction] = useFormState(createContact, initialState);
  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField label="Contact name" name="name" />
      <FormField label="Email" name="email" type="email" required={false} />
      <FormField label="Phone" name="phone" required={false} />
      <FormField label="Designation" name="designation" required={false} />
      <label className="block sm:col-span-2">
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
      {state.error && <p className="sm:col-span-2 text-sm text-danger">{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="Adding…">Add contact</SubmitButton>
      </div>
    </form>
  );
}

function LeadForm({ companies }: { companies: Company[] }) {
  const [state, formAction] = useFormState(createLead, initialState);
  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField label="Lead name" name="name" />
      <FormField label="Source" name="source" required={false} />
      <FormField label="Estimated value ($)" name="estimatedValue" type="number" required={false} />
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
      {state.error && <p className="sm:col-span-2 text-sm text-danger">{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="Adding…">Add lead</SubmitButton>
      </div>
    </form>
  );
}
