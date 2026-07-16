import { Router } from 'express';
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
function canAccessOrganization(req, organizationId) {
    const resolvedId = Array.isArray(organizationId) ? organizationId[0] : organizationId;
    const userRole = req.user?.role;
    return userRole === 'Super Admin' || req.user?.organizationId === resolvedId;
}
router.get('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { page = '1', limit = '20' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = supabase.from('organizations').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (req.user?.role !== 'Super Admin' && req.user?.organizationId) {
            query = query.eq('id', req.user.organizationId);
        }
        const { data, error, count } = await query.range(offset, offset + Number(limit) - 1);
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [], total: count ?? 0, page: Number(page), limit: Number(limit) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list organizations' });
    }
});
router.get('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { id } = req.params;
        if (!canAccessOrganization(req, id)) {
            res.status(403).json({ success: false, message: 'Organization access denied' });
            return;
        }
        const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
        if (error) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get organization' });
    }
});
router.put('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { id } = req.params;
        if (!canAccessOrganization(req, id)) {
            res.status(403).json({ success: false, message: 'Organization access denied' });
            return;
        }
        const { name, slug, settings } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (slug !== undefined)
            updates.slug = slug;
        if (settings !== undefined)
            updates.settings = settings;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('organizations').update(updates).eq('id', id).select().single();
        if (error) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update organization' });
    }
});
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { id } = req.params;
        if (!canAccessOrganization(req, id)) {
            res.status(403).json({ success: false, message: 'Organization access denied' });
            return;
        }
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        res.json({ success: true, message: 'Organization deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete organization' });
    }
});
router.get('/:id/users', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { id } = req.params;
        if (!canAccessOrganization(req, id)) {
            res.status(403).json({ success: false, message: 'Organization access denied' });
            return;
        }
        const { data, error } = await supabase.from('organization_users').select('*').eq('organization_id', id);
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get organization users' });
    }
});
router.get('/:id/usage', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { id } = req.params;
        if (!canAccessOrganization(req, id)) {
            res.status(403).json({ success: false, message: 'Organization access denied' });
            return;
        }
        const { period = 'monthly' } = req.query;
        const { data, error } = await supabase.from('usage_metrics').select('*').eq('organization_id', id).eq('period', period).order('recorded_at', { ascending: false }).limit(30);
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get usage data' });
    }
});
router.get('/:id/billing', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { id } = req.params;
        if (!canAccessOrganization(req, id)) {
            res.status(403).json({ success: false, message: 'Organization access denied' });
            return;
        }
        const { data, error } = await supabase.from('billing_info').select('*').eq('organization_id', id).single();
        if (error) {
            res.json({ success: true, data: null });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get billing info' });
    }
});
export default router;
