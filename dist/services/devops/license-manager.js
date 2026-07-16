import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
function generateId() {
    return crypto.randomUUID();
}
const PLAN_FEATURES = {
    starter: ['basic_ai', 'basic_seo'],
    professional: ['advanced_ai', 'seo', 'analytics'],
    business: ['unlimited_ai', 'white_label', 'api'],
    enterprise: ['everything'],
};
const PLAN_DURATION_DAYS = {
    starter: 30,
    professional: 30,
    business: 30,
    enterprise: 365,
};
export class LicenseManager {
    async generateLicense(orgId, plan) {
        const supabase = getSupabase();
        const licenseKey = `BA-${plan.toUpperCase()}-${crypto.randomUUID().toUpperCase().replace(/-/g, '').slice(0, 16)}-${Date.now().toString(36).toUpperCase()}`;
        const id = generateId();
        const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.starter;
        const durationDays = PLAN_DURATION_DAYS[plan] ?? 30;
        const validFrom = new Date();
        const validUntil = new Date(validFrom.getTime() + durationDays * 24 * 60 * 60 * 1000);
        const { error } = await supabase.from('licenses').insert({
            id,
            organization_id: orgId,
            license_key: licenseKey,
            plan,
            status: 'active',
            seats: plan === 'enterprise' ? 9999 : plan === 'business' ? 25 : plan === 'professional' ? 5 : 1,
            features,
            valid_from: validFrom.toISOString(),
            valid_until: validUntil.toISOString(),
            auto_renew: plan !== 'starter',
            created_at: new Date().toISOString(),
        });
        if (error)
            throw new Error(error.message);
        return {
            id,
            organizationId: orgId,
            licenseKey,
            plan,
            status: 'active',
            features,
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString(),
            autoRenew: plan !== 'starter',
        };
    }
    async validateLicense(licenseKey) {
        const supabase = getSupabase();
        const { data } = await supabase.from('licenses').select('*').eq('license_key', licenseKey).single();
        if (!data)
            return { valid: false, message: 'License not found' };
        if (data.status === 'revoked' || data.status === 'suspended') {
            return { valid: false, message: `License is ${data.status}` };
        }
        const validUntil = new Date(data.valid_until);
        if (validUntil < new Date()) {
            await supabase.from('licenses').update({ status: 'expired', last_validated: new Date().toISOString() }).eq('id', data.id);
            return { valid: false, message: 'License has expired' };
        }
        await supabase.from('licenses').update({ last_validated: new Date().toISOString() }).eq('id', data.id);
        return { valid: true, license: this.mapRow(data) };
    }
    async activateLicense(licenseKey) {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('licenses').update({ status: 'active', last_validated: new Date().toISOString() }).eq('license_key', licenseKey).select().single();
        if (error)
            throw new Error(error.message);
        if (!data)
            throw new Error('License not found');
        return this.mapRow(data);
    }
    async revokeLicense(licenseKey) {
        const supabase = getSupabase();
        const { error } = await supabase.from('licenses').update({ status: 'revoked', last_validated: new Date().toISOString() }).eq('license_key', licenseKey);
        if (error)
            throw new Error(error.message);
    }
    async getLicense(orgId) {
        const supabase = getSupabase();
        const { data } = await supabase.from('licenses').select('*').eq('organization_id', orgId).single();
        return data ? this.mapRow(data) : null;
    }
    async getAllLicenses(filters) {
        const supabase = getSupabase();
        let query = supabase.from('licenses').select('*').order('created_at', { ascending: false });
        if (filters?.plan)
            query = query.eq('plan', filters.plan);
        if (filters?.status)
            query = query.eq('status', filters.status);
        const { data } = await query;
        return (data ?? []).map(this.mapRow);
    }
    async getLicenseFeatures(plan) {
        return PLAN_FEATURES[plan] ?? PLAN_FEATURES.starter;
    }
    mapRow(row) {
        return {
            id: row.id,
            organizationId: row.organization_id,
            licenseKey: row.license_key,
            plan: row.plan,
            status: row.status,
            seats: row.seats,
            features: row.features,
            validFrom: row.valid_from,
            validUntil: row.valid_until,
            autoRenew: row.auto_renew,
            lastValidated: row.last_validated,
        };
    }
}
