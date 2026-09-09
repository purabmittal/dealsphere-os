import Link from 'next/link';
import { Building2, Users } from 'lucide-react';

const SETTINGS_SECTIONS = [
  { href: '/settings/organization', label: 'Organization', description: 'Name, currency, timezone.', icon: Building2 },
  { href: '/settings/team', label: 'Team & roles', description: 'Manage members and role assignments.', icon: Users },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-ink-900">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">
        Notifications, AI, integrations, security, and audit-log settings land in later phases alongside the modules
        they configure.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-border bg-surface-raised p-4 transition-colors hover:border-accent/40"
          >
            <section.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <div className="mt-2 text-sm font-medium text-ink-900">{section.label}</div>
            <div className="mt-0.5 text-xs text-ink-500">{section.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
