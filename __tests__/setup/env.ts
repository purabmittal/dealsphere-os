// Minimal env stubs so modules that read process.env at import time don't
// throw during unit tests. Integration tests that need a real Supabase
// project set their own env vars (see rls-isolation.test.ts).
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';
