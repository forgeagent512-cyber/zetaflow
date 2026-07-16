import { Router } from 'express';
import { AEOEngine } from '../../services/seo/aeo-engine.js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
const aeoEngine = new AEOEngine();
router.post('/faqs', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        const { topic } = req.body;
        if (!topic) {
            res.status(400).json({ success: false, message: 'Topic is required' });
            return;
        }
        const faqs = await aeoEngine.generateFAQs(orgId, topic);
        res.json({ success: true, data: faqs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'FAQ generation failed' });
    }
});
router.post('/answer', authenticate, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            res.status(400).json({ success: false, message: 'Question is required' });
            return;
        }
        const answer = await aeoEngine.generateAnswerBlock(question);
        res.json({ success: true, data: answer });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Answer generation failed' });
    }
});
router.post('/how-to', authenticate, async (req, res) => {
    try {
        const { topic, steps } = req.body;
        if (!topic || !steps || !Array.isArray(steps)) {
            res.status(400).json({ success: false, message: 'Topic and steps array are required' });
            return;
        }
        const content = await aeoEngine.generateHowToContent(topic, steps);
        res.json({ success: true, data: content });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'How-to content generation failed' });
    }
});
router.post('/comparison', authenticate, async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            res.status(400).json({ success: false, message: 'Items array is required' });
            return;
        }
        const content = await aeoEngine.generateComparisonPage(items);
        res.json({ success: true, data: content });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Comparison generation failed' });
    }
});
router.post('/glossary', authenticate, async (req, res) => {
    try {
        const { terms } = req.body;
        if (!terms || !Array.isArray(terms)) {
            res.status(400).json({ success: false, message: 'Terms array is required' });
            return;
        }
        const glossary = await aeoEngine.generateGlossary(terms);
        res.json({ success: true, data: glossary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Glossary generation failed' });
    }
});
router.post('/featured-snippet', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            res.status(400).json({ success: false, message: 'Content is required' });
            return;
        }
        const optimized = await aeoEngine.optimizeForFeaturedSnippets(content);
        res.json({ success: true, data: { optimizedContent: optimized } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Featured snippet optimization failed' });
    }
});
export default router;
