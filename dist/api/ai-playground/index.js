import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Playground } from '../../services/ai-orchestrator/playground.js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
const playground = new Playground();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
router.post('/generate', authenticate, async (req, res) => {
    try {
        const { prompt, model, tier, parameters } = req.body;
        if (!prompt || !model) {
            res.status(400).json({ success: false, message: 'Prompt and model are required' });
            return;
        }
        const result = await playground.generate(prompt, model, tier, parameters);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Generation failed' });
    }
});
router.post('/compare', authenticate, async (req, res) => {
    try {
        const { prompt, models } = req.body;
        if (!prompt || !models || !Array.isArray(models) || models.length < 2) {
            res.status(400).json({ success: false, message: 'Prompt and at least 2 models are required' });
            return;
        }
        const results = await playground.compareModels(prompt, models);
        res.json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Comparison failed' });
    }
});
router.get('/sessions', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { data, error } = await supabase.from('playground_sessions').select('*').eq('organization_id', orgId).order('updated_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list sessions' });
    }
});
router.post('/sessions', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { name, model, prompt, response, parameters } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Name is required' });
            return;
        }
        const { data, error } = await supabase.from('playground_sessions').insert({
            organization_id: orgId, name, model, prompt, response, parameters,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to save session' });
    }
});
router.get('/sessions/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { data, error } = await supabase.from('playground_sessions').select('*').eq('id', id).eq('organization_id', orgId).single();
        if (error) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get session' });
    }
});
router.delete('/sessions/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { error } = await supabase.from('playground_sessions').delete().eq('id', id).eq('organization_id', orgId);
        if (error) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }
        res.json({ success: true, message: 'Session deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete session' });
    }
});
export default router;
