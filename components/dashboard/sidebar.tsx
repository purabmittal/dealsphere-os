'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, Menu, X } from 'lucide-react';
import type { NavGroup } from '@/lib/database/navigation';
import { NavIcon } from '@/components/dashboard/nav-icon';

export function Sidebar({ groups, orgName }: { groups: NavGroup[]; orgName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && <span className="truncate text-sm font-semibold text-ink-900">{orgName}</span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden rounded-md p-1.5 text-ink-500 hover:bg-accent-soft hover:text-ink-900 md:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1.5 text-ink-500 hover:bg-accent-soft md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {groups.map((group, i) => (
          <div key={group.label ?? `group-${i}`}>
            {group.label && !collapsed && (
              <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-ink-300">{group.label}</div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                        active ? 'bg-accent-soft font-medium text-accent' : 'text-ink-700 hover:bg-surface'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <NavIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile top bar trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 rounded-md border border-border bg-surface-raised p-2 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen flex-col border-r border-border bg-surface-raised transition-all md:flex ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface-raised shadow-lg">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
