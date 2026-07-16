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
router.get('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { unreadOnly, page = '1', limit = '50' } = req.query;
        let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('organization_id', orgId);
        if (unreadOnly === 'true')
            query = query.eq('is_read', false);
        const offset = (Number(page) - 1) * Number(limit);
        const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [], total: count ?? 0, page: Number(page), limit: Number(limit) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get notifications' });
    }
});
router.post('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { userId, type, title, message, channel = 'in_app' } = req.body;
        if (!type || !title || !message) {
            res.status(400).json({ success: false, message: 'Type, title, and message are required' });
            return;
        }
        const { data, error } = await supabase.from('notifications').insert({
            organization_id: orgId, user_id: userId, type, title, message, channel, is_read: false,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to send notification' });
    }
});
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { data, error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id).eq('organization_id', orgId).select().single();
        if (error) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to mark notification as read' });
    }
});
router.put('/settings', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { email, slack, webhook, inApp } = req.body;
        const settings = {};
        if (email !== undefined)
            settings.email = email;
        if (slack !== undefined)
            settings.slack = slack;
        if (webhook !== undefined)
            settings.webhook = webhook;
        if (inApp !== undefined)
            settings.in_app = inApp;
        settings.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('notification_settings').upsert({
            organization_id: orgId, ...settings,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update notification settings' });
    }
});
export default router;
