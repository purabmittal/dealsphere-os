import { redirect } from 'next/navigation';
import { requirePermission, PermissionError } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { DealsBoard } from '@/components/deals/deals-board';
import { DealCreateForm } from '@/components/deals/deal-create-form';

const STAGES = ['NEW', 'CONTACTED', 'DISCOVERY', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

export default async function DealsPage() {
  try {
    await requirePermission('DEALS', 'VIEW');
  } catch (err) {
    if (err instanceof PermissionError) redirect('/dashboard');
    throw err;
  }

  const supabase = createClient();

  const [{ data: deals }, { data: companies }] = await Promise.all([
    supabase
      .from('deals')
      .select('id, title, value, stage, companies(name)')
      .order('created_at', { ascending: false }),
    supabase.from('companies').select('id, name').order('name'),
  ]);

  const typedDeals = (deals ?? []) as unknown as {
    id: string;
    title: string;
    value: number | null;
    stage: (typeof STAGES)[number];
    companies: { name: string } | null;
  }[];
  const typedCompanies = (companies ?? []) as { id: string; name: string }[];

  const totalPipelineValue = typedDeals
    .filter((d) => d.stage !== 'WON' && d.stage !== 'LOST')
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-ink-900">Deals</h1>
        <div className="text-sm text-ink-500">
          Open pipeline value: <span className="font-medium text-ink-900">${totalPipelineValue.toLocaleString()}</span>
        </div>
      </div>

      <DealCreateForm companies={typedCompanies} />
      <div className="mt-6">
        <DealsBoard deals={typedDeals} stages={STAGES} />
      </div>
    </div>
  );
}
