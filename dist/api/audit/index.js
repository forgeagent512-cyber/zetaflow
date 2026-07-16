import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuditService } from '../../services/security/audit.service.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
const router = Router();
const audit = new AuditService();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
router.get('/logs', authenticate, requireRole('Super Admin', 'Organization Admin'), async (req, res) => {
    try {
        const supabase = getSupabase();
        const organizationId = req.organizationId;
        const q = req.query;
        const logs = await audit.query(supabase, {
            organizationId,
            action: typeof q.action === 'string' ? q.action : undefined,
            limit: typeof q.limit === 'string' ? Number(q.limit) : 50,
            offset: typeof q.offset === 'string' ? Number(q.offset) : 0,
        });
        res.json({ success: true, data: { logs } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch audit logs' });
    }
});
router.get('/logs/admin', authenticate, requireRole('Super Admin'), async (_req, res) => {
    try {
        const supabase = getSupabase();
        const logs = await audit.query(supabase, { limit: 100 });
        res.json({ success: true, data: { logs } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch audit logs' });
    }
});
export default router;
