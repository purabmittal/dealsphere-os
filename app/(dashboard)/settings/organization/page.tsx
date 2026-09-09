import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { OrganizationForm } from '@/components/dashboard/organization-form';

export default async function OrganizationSettingsPage() {
  let actor;
  try {
    actor = await requirePermission('SETTINGS', 'EDIT');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('name, currency, timezone')
    .eq('id', actor.organizationId)
    .single();

  if (!org) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-ink-900">Organization</h1>
      <p className="mt-1 text-sm text-ink-500">These settings apply across your whole workspace.</p>
      <OrganizationForm initial={org} />
    </div>
  );
}
