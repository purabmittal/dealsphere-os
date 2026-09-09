import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { TeamRoleManager } from '@/components/dashboard/team-role-manager';

export default async function TeamSettingsPage() {
  try {
    await requirePermission('SETTINGS', 'MANAGE');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_active')
    .order('full_name');

  const { data: roleRows } = await supabase.from('user_roles').select('profile_id, role');

  const members = (profiles ?? []).map((p) => ({
    ...p,
    roles: (roleRows ?? []).filter((r) => r.profile_id === p.id).map((r) => r.role),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-ink-900">Team & roles</h1>
      <p className="mt-1 text-sm text-ink-500">
        Members are provisioned automatically on signup. Assign additional roles here to grant module access.
      </p>

      <TeamRoleManager members={members} />
    </div>
  );
}
