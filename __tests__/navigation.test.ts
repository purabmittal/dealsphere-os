import { describe, it, expect } from 'vitest';
import { NAV_GROUPS } from '@/lib/database/navigation';

const allItems = NAV_GROUPS.flatMap((g) => g.items);

describe('navigation config', () => {
  it('has no duplicate routes', () => {
    const hrefs = allItems.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('every item requiring a module lists a phase after Phase 1, except always-visible items', () => {
    for (const item of allItems) {
      if (item.module === null) {
        expect(item.phase).toBe(1); // Dashboard, Settings - live from day one
      } else {
        expect(item.phase).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('Dashboard and Settings are always visible (module: null)', () => {
    const dashboard = allItems.find((i) => i.href === '/dashboard');
    const settings = allItems.find((i) => i.href === '/settings');
    expect(dashboard?.module).toBeNull();
    expect(settings?.module).toBeNull();
  });

  it('covers every module named in the master spec sidebar', () => {
    const expectedRoutes = [
      '/crm', '/deals', '/clients', '/projects', '/tasks', '/calendar', '/communications',
      '/content', '/campaigns', '/careers', '/team', '/finance', '/invoices', '/contracts',
      '/documents', '/goals', '/analytics', '/support', '/knowledge', '/ai',
    ];
    const hrefs = allItems.map((i) => i.href);
    for (const route of expectedRoutes) {
      expect(hrefs).toContain(route);
    }
  });
});
