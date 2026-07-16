import { Router } from 'express';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
function generateLicenseKey() {
    return `BAG-${crypto.randomUUID().toUpperCase()}`;
}
router.post('/generate', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { orgId, plan, seats, expiresAt } = req.body;
        if (!orgId || !plan) {
            res.status(400).json({ success: false, message: 'Org ID and plan are required' });
            return;
        }
        const licenseKey = generateLicenseKey();
        const { data, error } = await supabase.from('licenses').insert({
            organization_id: orgId, license_key: licenseKey, plan, seats: seats ?? 1,
            expires_at: expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'License generation failed' });
    }
});
router.post('/validate', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { licenseKey } = req.body;
        if (!licenseKey) {
            res.status(400).json({ success: false, message: 'License key is required' });
            return;
        }
        const { data, error } = await supabase.from('licenses').select('*').eq('license_key', licenseKey).single();
        if (error || !data) {
            res.json({ success: true, data: { valid: false, message: 'License key not found' } });
            return;
        }
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (!data.is_active) {
            res.json({ success: true, data: { valid: false, message: 'License is deactivated' } });
            return;
        }
        if (expiresAt < now) {
            res.json({ success: true, data: { valid: false, message: 'License has expired' } });
            return;
        }
        res.json({ success: true, data: { valid: true, plan: data.plan, seats: data.seats, expiresAt: data.expires_at } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'License validation failed' });
    }
});
router.post('/activate', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { licenseKey, orgId } = req.body;
        if (!licenseKey || !orgId) {
            res.status(400).json({ success: false, message: 'License key and org ID are required' });
            return;
        }
        const { data: license, error: findError } = await supabase.from('licenses').select('*').eq('license_key', licenseKey).single();
        if (findError || !license) {
            res.status(404).json({ success: false, message: 'License not found' });
            return;
        }
        if (license.organization_id && license.organization_id !== orgId) {
            res.status(400).json({ success: false, message: 'License already activated for another organization' });
            return;
        }
        const { data, error } = await supabase.from('licenses').update({
            organization_id: orgId, is_active: true, activated_at: new Date().toISOString(),
        }).eq('id', license.id).select().single();
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'License activation failed' });
    }
});
router.get('/:orgId', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { orgId } = req.params;
        const { data, error } = await supabase.from('licenses').select('*').eq('organization_id', orgId).single();
        if (error) {
            res.status(404).json({ success: false, message: 'License not found for organization' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get license' });
    }
});
export default router;
