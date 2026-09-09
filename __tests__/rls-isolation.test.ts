import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Integration test - requires a real (local or staging) Supabase project.
// Skips automatically if the env vars aren't set, so `npm test` stays green
// in CI environments that only run unit tests. Run with:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... npm test
const hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const describeIfConfigured = hasSupabaseEnv ? describe : describe.skip;

describeIfConfigured('multi-tenant isolation (integration)', () => {
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const TEST_EMAIL_A = `phase1-test-a-${Date.now()}@example.com`;
  const TEST_EMAIL_B = `phase1-test-b-${Date.now()}@example.com`;
  const PASSWORD = 'test-password-12345';

  let orgAId: string;
  let orgBId: string;

  beforeAll(async () => {
    const { data: userA } = await admin.auth.admin.createUser({
      email: TEST_EMAIL_A,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { signup_type: 'new_organization', organization_name: 'Phase1 Test Org A' },
    });
    const { data: userB } = await admin.auth.admin.createUser({
      email: TEST_EMAIL_B,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { signup_type: 'new_organization', organization_name: 'Phase1 Test Org B' },
    });

    const { data: profileA } = await admin.from('profiles').select('organization_id').eq('id', userA!.user!.id).single();
    const { data: profileB } = await admin.from('profiles').select('organization_id').eq('id', userB!.user!.id).single();

    orgAId = profileA!.organization_id;
    orgBId = profileB!.organization_id;
  });

  it('provisions a distinct organization per signup', () => {
    expect(orgAId).not.toBe(orgBId);
  });

  it('a member of org A cannot read org B rows even with anon key + RLS', async () => {
    const clientA = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await clientA.auth.signInWithPassword({ email: TEST_EMAIL_A, password: PASSWORD });

    const { data, error } = await clientA.from('organizations').select('id').eq('id', orgBId);

    // RLS should return zero rows, not an error - the row is simply invisible.
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('the signup trigger grants SUPER_ADMIN on a brand-new organization', async () => {
    const { data } = await admin
      .from('user_roles')
      .select('role')
      .eq('organization_id', orgAId);

    expect(data?.map((r) => r.role)).toContain('SUPER_ADMIN');
  });
});
