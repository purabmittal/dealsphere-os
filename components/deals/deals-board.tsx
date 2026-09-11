'use client';

import { useTransition } from 'react';
import { updateDealStage } from '@/lib/database/deals-actions';

type Stage = 'NEW' | 'CONTACTED' | 'DISCOVERY' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

interface Deal {
  id: string;
  title: string;
  value: number | null;
  stage: Stage;
  companies: { name: string } | null;
}

export function DealsBoard({ deals, stages }: { deals: Deal[]; stages: readonly Stage[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        return (
          <div key={stage} className="w-64 shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                {stage.replace('_', ' ')}
              </span>
              <span className="text-xs text-ink-300">{stageDeals.length}</span>
            </div>
            <div className="space-y-2">
              {stageDeals.map((deal) => (
                <div key={deal.id} className="rounded-lg border border-border bg-surface-raised p-3">
                  <div className="text-sm font-medium text-ink-900">{deal.title}</div>
                  <div className="text-xs text-ink-500">
                    {deal.companies?.name ?? 'No company'}
                    {deal.value ? ` · $${deal.value.toLocaleString()}` : ''}
                  </div>
                  <select
                    disabled={isPending}
                    value={deal.stage}
                    onChange={(e) =>
                      startTransition(() => {
                        updateDealStage(deal.id, e.target.value as Stage);
                      })
                    }
                    className="mt-2 w-full rounded-md border border-border bg-white px-2 py-1 text-xs text-ink-900 focus:border-accent focus:outline-none"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-ink-300">
                  No deals
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
