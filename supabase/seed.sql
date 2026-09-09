-- ============================================================================
-- seed.sql
-- Local/dev demo data only. Everything here is clearly marked as demo via the
-- "[DEMO]" name prefix so it can never be mistaken for real tenant data.
--
-- This does NOT create an auth.users row - Supabase Auth users must be
-- created through the Auth API (sign up normally at /signup), which fires
-- handle_new_user() and provisions the organization automatically. This
-- seed only adds a second, pre-existing organization row so you can verify
-- multi-tenant isolation (organization A must never see organization B).
--
-- Run with: npm run db:seed  (requires SUPABASE_DB_URL in your environment)
-- ============================================================================

insert into organizations (id, name, slug, currency, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  '[DEMO] Acme Isolation Test Org',
  'demo-acme-isolation-test',
  'USD',
  'America/New_York'
)
on conflict (id) do nothing;

-- No profile/user_roles rows are seeded for this org: it exists purely so
-- that Phase 1 RLS tests can assert a real user in Organization A gets zero
-- rows when querying Organization B's data.
