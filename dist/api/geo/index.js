import { Router } from 'express';
import { GEOEngine } from '../../services/seo/geo-engine.js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
const geoEngine = new GEOEngine();
router.post('/entities', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        if (req.body?.action === 'create') {
            const { name, entityType, description, attributes, relationships, context } = req.body;
            const entity = await geoEngine.createEntity({
                organizationId: orgId, name, entityType, description, attributes, relationships, context,
            });
            res.json({ success: true, data: entity });
        }
        else if (req.body?.action === 'list') {
            const { createClient } = await import('@supabase/supabase-js');
            const url = process.env.SUPABASE_URL;
            const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
            const supabase = createClient(url, key, { auth: { persistSession: false } });
            const { data } = await supabase.from('geo_entities').select('*').eq('organization_id', orgId);
            res.json({ success: true, data: data ?? [] });
        }
        else {
            res.status(400).json({ success: false, message: 'Action (create/list) is required' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Entity operation failed' });
    }
});
router.post('/knowledge-graph', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        const { entities } = req.body;
        if (!entities || !Array.isArray(entities)) {
            res.status(400).json({ success: false, message: 'Entities array is required' });
            return;
        }
        const graph = await geoEngine.buildKnowledgeGraph(orgId, entities);
        res.json({ success: true, data: graph });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Knowledge graph build failed' });
    }
});
router.post('/optimize', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            res.status(400).json({ success: false, message: 'Content is required' });
            return;
        }
        const optimized = await geoEngine.optimizeForAISearch(content);
        res.json({ success: true, data: { optimizedContent: optimized } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'AI optimization failed' });
    }
});
router.post('/entity-pages', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        const { entities } = req.body;
        if (!entities || !Array.isArray(entities)) {
            res.status(400).json({ success: false, message: 'Entities array is required' });
            return;
        }
        const pages = await geoEngine.generateEntityPages(orgId, entities);
        res.json({ success: true, data: pages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Entity page generation failed' });
    }
});
router.post('/topic-clusters', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        const { topics } = req.body;
        if (!topics || !Array.isArray(topics)) {
            res.status(400).json({ success: false, message: 'Topics array is required' });
            return;
        }
        const clusters = await geoEngine.createTopicClusters(orgId, topics);
        res.json({ success: true, data: clusters });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Topic cluster creation failed' });
    }
});
export default router;
