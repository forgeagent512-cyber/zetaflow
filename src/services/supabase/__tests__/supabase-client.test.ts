import test from 'node:test';
import assert from 'node:assert/strict';
import { getSupabaseConfig, validateSupabaseConfig } from '../supabase-client.js';

test('getSupabaseConfig validates required Supabase settings', () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousAnonKey = process.env.SUPABASE_ANON_KEY;
  const previousServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

  const config = getSupabaseConfig();
  assert.equal(config.url, 'https://example.supabase.co');
  assert.equal(config.anonKey, 'anon-key');
  assert.equal(config.serviceRoleKey, 'service-key');

  delete process.env.SUPABASE_URL;
  assert.throws(() => validateSupabaseConfig(), /SUPABASE_URL/);

  process.env.SUPABASE_URL = previousUrl ?? '';
  process.env.SUPABASE_ANON_KEY = previousAnonKey ?? '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = previousServiceRoleKey ?? '';
});
