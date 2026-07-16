import { Router } from 'express';
import { ContentStudio } from '../../services/seo/content-studio.js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
const contentStudio = new ContentStudio();
router.post('/landing-page', authenticate, async (req, res) => {
    try {
        const { industry, audience, goal } = req.body;
        if (!industry || !audience || !goal) {
            res.status(400).json({ success: false, message: 'Industry, audience, and goal are required' });
            return;
        }
        const page = await contentStudio.generateLandingPage({ industry, audience, goal });
        res.json({ success: true, data: page });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Landing page generation failed' });
    }
});
router.post('/blog-post', authenticate, async (req, res) => {
    try {
        const { topic, keywords } = req.body;
        if (!topic || !keywords || !Array.isArray(keywords)) {
            res.status(400).json({ success: false, message: 'Topic and keywords array are required' });
            return;
        }
        const post = await contentStudio.generateBlogPost(topic, keywords);
        res.json({ success: true, data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Blog post generation failed' });
    }
});
router.post('/article', authenticate, async (req, res) => {
    try {
        const { topic, outline } = req.body;
        if (!topic || !outline || !Array.isArray(outline)) {
            res.status(400).json({ success: false, message: 'Topic and outline array are required' });
            return;
        }
        const article = await contentStudio.generateArticle(topic, outline);
        res.json({ success: true, data: article });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Article generation failed' });
    }
});
router.post('/case-study', authenticate, async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            res.status(400).json({ success: false, message: 'Case study data is required' });
            return;
        }
        const study = await contentStudio.generateCaseStudy(data);
        res.json({ success: true, data: study });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Case study generation failed' });
    }
});
router.post('/email', authenticate, async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            res.status(400).json({ success: false, message: 'Email campaign data is required' });
            return;
        }
        const campaign = await contentStudio.generateEmailCampaign(data);
        res.json({ success: true, data: campaign });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Email campaign generation failed' });
    }
});
router.post('/sales-page', authenticate, async (req, res) => {
    try {
        const product = req.body;
        if (!product) {
            res.status(400).json({ success: false, message: 'Product data is required' });
            return;
        }
        const page = await contentStudio.generateSalesPage(product);
        res.json({ success: true, data: page });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Sales page generation failed' });
    }
});
router.post('/whitepaper', authenticate, async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            res.status(400).json({ success: false, message: 'Topic is required' });
            return;
        }
        const whitepaper = await contentStudio.generateWhitepaper(topic);
        res.json({ success: true, data: whitepaper });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Whitepaper generation failed' });
    }
});
export default router;
