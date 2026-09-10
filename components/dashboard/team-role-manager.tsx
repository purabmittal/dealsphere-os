'use client';

import { useFormState } from 'react-dom';
import { useTransition } from 'react';
import { X } from 'lucide-react';
import { assignRole, removeRole, type ActionState } from '@/lib/database/settings-actions';
import { SubmitButton } from '@/components/ui/submit-button';
import type { AppRole } from '@/types/database.types';

const ALL_ROLES: AppRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'SALES',
  'MARKETING',
  'PROJECT_MANAGER',
  'RECRUITMENT',
  'FINANCE',
  'SUPPORT',
  'MEMBER',
];

interface Member {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  roles: AppRole[];
}

const initialState: ActionState = { error: null };

export function TeamRoleManager({ members }: { members: Member[] }) {
  return (
    <div className="mt-6 space-y-3">
      {members.map((member) => (
        <MemberRow key={member.id} member={member} />
      ))}
      {members.length === 0 && <p className="text-sm text-ink-300">No team members yet.</p>}
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  const [state, formAction] = useFormState(assignRole, initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-900">{member.full_name}</div>
          <div className="text-xs text-ink-500">{member.email}</div>
        </div>
        {!member.is_active && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Inactive</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {member.roles.map((role) => (
          <span
            key={role}
            className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
          >
            {role.replace('_', ' ')}
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  removeRole(member.id, role);
                })
              }
              className="text-accent/60 hover:text-accent"
              aria-label={`Remove ${role} from ${member.full_name}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <form action={formAction} className="mt-3 flex items-end gap-2">
        <input type="hidden" name="profileId" value={member.id} />
        <label className="flex-1">
          <span className="mb-1 block text-xs text-ink-500">Add role</span>
          <select
            name="role"
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-sm text-ink-900 focus:border-accent focus:outline-none"
          >
            {ALL_ROLES.filter((r) => !member.roles.includes(r)).map((role) => (
              <option key={role} value={role}>
                {role.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton pendingLabel="Adding…">Add</SubmitButton>
      </form>
      {state.error && <p className="mt-1.5 text-xs text-danger">{state.error}</p>}
    </div>
  );
}
