import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import { getVisibleNavGroups } from '@/lib/database/visible-navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Belt-and-braces: middleware already redirects unauthenticated requests,
  // this catches the case of a valid session with no profile row yet
  // (e.g. the auth trigger failed) rather than rendering a broken shell.
  if (!user) {
    redirect('/login');
  }

  const [navGroups, org] = await Promise.all([
    getVisibleNavGroups(user.roles),
    createClient().from('organizations').select('name').eq('id', user.organizationId).single(),
  ]);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar groups={navGroups} orgName={org.data?.name ?? 'DealSphere OS'} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
