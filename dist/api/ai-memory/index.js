import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AiMemory } from '../../services/ai-orchestrator/ai-memory.js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
const memoryManager = new AiMemory();
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
        const { employeeId, search, limit = '50', type } = req.query;
        let query = supabase.from('ai_memory').select('*').eq('organization_id', orgId);
        if (employeeId)
            query = query.eq('employee_id', employeeId);
        if (type)
            query = query.eq('type', type);
        if (search)
            query = query.ilike('content', `%${search}%`);
        query = query.order('created_at', { ascending: false }).limit(Number(limit));
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to recall memory' });
    }
});
router.post('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { employeeId, type, content, metadata } = req.body;
        if (!employeeId || !type || !content) {
            res.status(400).json({ success: false, message: 'EmployeeId, type, and content are required' });
            return;
        }
        const { data, error } = await supabase.from('ai_memory').insert({
            organization_id: orgId, employee_id: employeeId, type, content, metadata,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to store memory' });
    }
});
router.delete('/cleanup', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { employeeId, olderThan } = req.body;
        if (!employeeId) {
            res.status(400).json({ success: false, message: 'EmployeeId is required' });
            return;
        }
        let query = supabase.from('ai_memory').delete().eq('organization_id', orgId).eq('employee_id', employeeId);
        if (olderThan)
            query = query.lt('created_at', olderThan);
        const { error, data } = await query;
        if (error)
            throw new Error(error.message);
        res.json({ success: true, message: 'Memory cleaned up', data: { deleted: data ?? [] } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to cleanup memory' });
    }
});
export default router;
