# DealSphere OS

The internal operating system for DealSphere. This repo currently implements
**Phase 1: Foundation** — authentication, multi-tenant organizations, RBAC,
row-level security, and the dashboard shell with full navigation. Every
other module (CRM, Deals, Finance, Careers, AI, etc.) has a route, a nav
entry, and permission gating already in place, and renders an honest
"not built yet" state rather than fake data or dead buttons.

## Stack

Next.js 14 (App Router) · TypeScript (strict) · Supabase (Postgres, Auth,
RLS) · Tailwind CSS · Vitest

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (or run one locally with the Supabase CLI).

3. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   your project's Settings → API page. Fill in `SUPABASE_SERVICE_ROLE_KEY`
   from the same page (server-only — never commit it, never expose it to the
   client). Fill in `SUPABASE_DB_URL` from Settings → Database → Connection
   string (used only by the seed script).

4. **Run the migrations** against your project. With the Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This runs `supabase/migrations/0001` through `0005` in order: core tables,
   RLS helper functions, RLS policies, signup provisioning trigger, and the
   default role/permission matrix.

5. **(Optional) Seed demo data**
   ```bash
   npm run db:seed
   ```
   This adds one clearly-marked demo organization (`[DEMO] ...`) so you can
   verify tenant isolation. It does not create any auth users — sign up
   normally to create your first real account.

6. **Regenerate types once linked** (the committed `types/database.types.ts`
   is hand-written to match the migrations exactly, but the CLI output is
   the source of truth going forward):
   ```bash
   npm run db:types
   ```

7. **Run the app**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`, click "Create one", and sign up. The
   first user to sign up for a given company becomes `SUPER_ADMIN` of a
   brand-new organization automatically (see `handle_new_user()` in
   `supabase/migrations/0004_signup_provisioning.sql`).

## Architecture notes

- **Multi-tenancy**: every business table carries `organization_id`. RLS
  policies enforce isolation at the database level — the application code
  additionally checks permissions before mutating, but even a bug in app
  code cannot leak data across organizations, because Postgres itself will
  refuse the row.
- **RBAC**: `lib/permissions/index.ts` (`hasPermission`, `requirePermission`)
  and the database's `auth_has_permission()` function share the same
  resolution logic — there's exactly one permission matrix
  (`role_permissions` table), not a duplicated copy in TypeScript and SQL
  that can drift apart.
- **Audit log**: `audit_logs` is append-only at the trigger level (`UPDATE`/
  `DELETE` are rejected by Postgres, not just discouraged by convention).
  Write to it via `lib/database/audit.ts#recordAuditEntry`.
- **Adding a new module** (e.g. Phase 2's CRM): add rows to the
  `app_module` enum if needed (it already lists every module from the
  spec), give roles permissions on it in `role_permissions`, then replace
  the corresponding stub in `app/(dashboard)/<module>/page.tsx` — the nav
  entry, route, and access gate already exist.

## Testing

```bash
npm test
```

Unit tests (`__tests__/navigation.test.ts`, `__tests__/permission-error.test.ts`)
run with no external dependencies. `__tests__/rls-isolation.test.ts` is an
integration test that exercises real tenant isolation against a live
Supabase project — it auto-skips unless `SUPABASE_SERVICE_ROLE_KEY` is set,
so it won't break CI runs that only have anon credentials:

```bash
SUPABASE_SERVICE_ROLE_KEY=... npm test
```

## Deployment

```
GitHub → Vercel → Supabase
```

Push this repo to GitHub, import it in Vercel, set the same environment
variables from `.env.example` in the Vercel project settings, and deploy.
Run migrations against your production Supabase project the same way as
step 4 above before the first deploy.

## What's next (Phase 2)

CRM, Deals, Clients, Projects, and Tasks — the core business lifecycle.
Each will follow the same pattern already established here: a Supabase
migration, RLS policies, `role_permissions` grants, Server Actions gated by
`requirePermission`, and a real UI in place of today's stub page.
