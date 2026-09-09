import { logout } from '@/lib/auth/actions';
import type { CurrentUser } from '@/lib/permissions';

export function Topbar({ user }: { user: CurrentUser }) {
  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b border-border bg-surface-raised px-4 md:px-6">
      <div className="text-right">
        <div className="text-sm font-medium leading-tight text-ink-900">{user.fullName}</div>
        <div className="text-xs leading-tight text-ink-500">{user.roles.join(', ')}</div>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
        {initials}
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
