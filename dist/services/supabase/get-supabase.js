import { createClient } from '@supabase/supabase-js';
let cachedClient = null;
export function getSupabase() {
    if (cachedClient)
        return cachedClient;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set');
    cachedClient = createClient(url, key, { auth: { persistSession: false } });
    return cachedClient;
}
