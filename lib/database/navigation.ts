import type { AppModule } from '@/types/database.types';

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide-react icon name, resolved in components/dashboard/sidebar.tsx
  module: AppModule | null; // null = always visible (e.g. Dashboard, Settings)
  /** Phase this module ships in. Phase 1 items are fully wired; later phases render a "coming in Phase N" page so the link is honest about what it does. */
  phase: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', module: null, phase: 1 }],
  },
  {
    label: 'CRM & Sales',
    items: [
      { label: 'CRM', href: '/crm', icon: 'Users', module: 'CRM', phase: 2 },
      { label: 'Deals', href: '/deals', icon: 'Handshake', module: 'DEALS', phase: 2 },
      { label: 'Clients', href: '/clients', icon: 'Building2', module: 'CLIENTS', phase: 2 },
      { label: 'Projects', href: '/projects', icon: 'ClipboardList', module: 'PROJECTS', phase: 2 },
      { label: 'Tasks', href: '/tasks', icon: 'CheckSquare', module: 'TASKS', phase: 2 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Calendar', href: '/calendar', icon: 'Calendar', module: 'CALENDAR', phase: 3 },
      { label: 'Communications', href: '/communications', icon: 'MessageSquare', module: 'COMMUNICATIONS', phase: 3 },
      { label: 'Content', href: '/content', icon: 'Smartphone', module: 'CONTENT', phase: 3 },
      { label: 'Campaigns', href: '/campaigns', icon: 'Megaphone', module: 'CAMPAIGNS', phase: 3 },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Careers', href: '/careers', icon: 'Briefcase', module: 'CAREERS', phase: 3 },
      { label: 'Team', href: '/team', icon: 'UserCog', module: 'TEAM', phase: 3 },
    ],
  },
  {
    label: 'Money & Documents',
    items: [
      { label: 'Finance', href: '/finance', icon: 'Wallet', module: 'FINANCE', phase: 4 },
      { label: 'Invoices', href: '/invoices', icon: 'Receipt', module: 'INVOICES', phase: 4 },
      { label: 'Contracts', href: '/contracts', icon: 'FileText', module: 'CONTRACTS', phase: 4 },
      { label: 'Documents', href: '/documents', icon: 'FolderOpen', module: 'DOCUMENTS', phase: 4 },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Goals & KPIs', href: '/goals', icon: 'Target', module: 'GOALS', phase: 5 },
      { label: 'Analytics', href: '/analytics', icon: 'BarChart3', module: 'ANALYTICS', phase: 5 },
      { label: 'Support', href: '/support', icon: 'Ticket', module: 'SUPPORT', phase: 5 },
      { label: 'Knowledge Base', href: '/knowledge', icon: 'BookOpen', module: 'KNOWLEDGE', phase: 5 },
    ],
  },
  {
    label: null,
    items: [
      { label: 'DealSphere AI', href: '/ai', icon: 'Sparkles', module: 'AI', phase: 6 },
      { label: 'Settings', href: '/settings', icon: 'Settings', module: null, phase: 1 },
    ],
  },
];
