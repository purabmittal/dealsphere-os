'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login, type AuthFormState } from '@/lib/auth/actions';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: AuthFormState = { error: null };

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get('confirmEmail') === '1';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-lg font-semibold tracking-tight text-ink-900">DealSphere OS</div>
          <p className="text-sm text-ink-500">Sign in to your command center.</p>
        </div>

        {justSignedUp && (
          <div className="mb-4 rounded-md border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-ink-700">
            Check your email to confirm your account, then sign in.
          </div>
        )}

        <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface-raised p-6">
          <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
          <FormField label="Password" name="password" type="password" autoComplete="current-password" />

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          No account yet?{' '}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
