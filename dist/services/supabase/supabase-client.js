import { createClient } from '@supabase/supabase-js';
export function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL?.trim();
    const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url) {
        throw new Error('SUPABASE_URL is required');
    }
    if (!anonKey && !serviceRoleKey) {
        throw new Error('SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is required');
    }
    return {
        url,
        anonKey: anonKey ?? serviceRoleKey ?? '',
        serviceRoleKey: serviceRoleKey ?? anonKey ?? ''
    };
}
export function validateSupabaseConfig() {
    return getSupabaseConfig();
}
export function createSupabaseClient() {
    const config = validateSupabaseConfig();
    return createClient(config.url, config.serviceRoleKey || config.anonKey, {
        auth: { persistSession: false }
    });
}
