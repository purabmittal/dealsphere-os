'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { signup, type AuthFormState } from '@/lib/auth/actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: AuthFormState = { error: null };

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-lg font-semibold tracking-tight text-ink-900">DealSphere OS</div>
          <p className="text-sm text-ink-500">Set up your organization's workspace.</p>
        </div>

        <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface-raised p-6">
          <FormField label="Your name" name="fullName" autoComplete="name" />
          <FormField label="Company name" name="organizationName" placeholder="Acme Inc." />
          <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
          <FormField label="Password" name="password" type="password" autoComplete="new-password" />

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <SubmitButton pendingLabel="Creating workspace…">Create workspace</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
