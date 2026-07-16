import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { SocialMediaGenerator } from '../../services/seo/social-media-generator.js';
import { VideoScriptGenerator } from '../../services/seo/video-script-generator.js';
import { KeywordResearch } from '../../services/seo/keyword-research.js';
import { CompetitorAnalysis } from '../../services/seo/competitor-analysis.js';
import { ContentStudio } from '../../services/seo/content-studio.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const socialMediaGenerator = new SocialMediaGenerator();
const videoScriptGenerator = new VideoScriptGenerator();
const keywordResearch = new KeywordResearch();
const competitorAnalysis = new CompetitorAnalysis();
const contentStudio = new ContentStudio();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.post('/campaigns', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    if (req.body?.action === 'create') {
      const { name, type, content, audience } = req.body;
      if (!name || !type) {
        res.status(400).json({ success: false, message: 'Name and type are required' });
        return;
      }
      const { data, error } = await supabase.from('marketing_campaigns').insert({
        organization_id: orgId, name, type, content, audience, status: 'draft',
      }).select().single();
      if (error) throw new Error(error.message);
      res.json({ success: true, data });
    } else {
      const { data, error } = await supabase.from('marketing_campaigns').select('*').eq('organization_id', orgId);
      if (error) throw new Error(error.message);
      res.json({ success: true, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Campaign operation failed' });
  }
});

router.post('/email', authenticate, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data) {
      res.status(400).json({ success: false, message: 'Email campaign data is required' });
      return;
    }
    const campaign = await contentStudio.generateEmailCampaign(data);
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Email generation failed' });
  }
});

router.post('/social', authenticate, async (req: Request, res: Response) => {
  try {
    const { platform, topic, tone } = req.body;
    if (!platform || !topic) {
      res.status(400).json({ success: false, message: 'Platform and topic are required' });
      return;
    }
    let content: any;
    switch (platform) {
      case 'linkedin':
        content = await socialMediaGenerator.generateLinkedInPost(topic, tone);
        break;
      case 'twitter':
        content = await socialMediaGenerator.generateTwitterPost(topic);
        break;
      case 'facebook':
        content = await socialMediaGenerator.generateFacebookPost(topic);
        break;
      case 'instagram':
        content = await socialMediaGenerator.generateInstagramPost(topic);
        break;
      case 'threads':
        content = await socialMediaGenerator.generateThreadsPost(topic);
        break;
      case 'reddit':
        content = await socialMediaGenerator.generateRedditPost(topic);
        break;
      case 'medium':
        content = await socialMediaGenerator.generateMediumArticle(topic);
        break;
      default:
        res.status(400).json({ success: false, message: `Unsupported platform: ${platform}` });
        return;
    }
    res.json({ success: true, data: { platform, topic, content } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Social post generation failed' });
  }
});

router.post('/video-script', authenticate, async (req: Request, res: Response) => {
  try {
    const { platform, topic, duration, product } = req.body;
    if (!platform || !topic) {
      res.status(400).json({ success: false, message: 'Platform and topic are required' });
      return;
    }
    let script: any;
    switch (platform) {
      case 'youtube':
        script = await videoScriptGenerator.generateYouTubeScript(topic, duration);
        break;
      case 'tiktok':
        script = await videoScriptGenerator.generateTikTokScript(topic);
        break;
      case 'reel':
        script = await videoScriptGenerator.generateReelScript(topic);
        break;
      case 'shorts':
        script = await videoScriptGenerator.generateShortsScript(topic);
        break;
      case 'webinar':
        script = await videoScriptGenerator.generateWebinarScript(topic, duration);
        break;
      case 'demo':
        if (!product) { res.status(400).json({ success: false, message: 'Product data required for demo script' }); return; }
        script = await videoScriptGenerator.generateDemoScript(product);
        break;
      default:
        res.status(400).json({ success: false, message: `Unsupported platform: ${platform}` });
        return;
    }
    res.json({ success: true, data: { platform, topic, script } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Video script generation failed' });
  }
});

router.post('/keywords', authenticate, async (req: Request, res: Response) => {
  try {
    const { action, seed, keyword } = req.body;
    if (!action) {
      res.status(400).json({ success: false, message: 'Action is required (discover, long-tail, competition, questions, intent, suggestions)' });
      return;
    }
    let result: any;
    switch (action) {
      case 'discover':
        if (!seed) { res.status(400).json({ success: false, message: 'Seed keyword is required' }); return; }
        result = await keywordResearch.discoverKeywords(seed);
        break;
      case 'long-tail':
        if (!keyword) { res.status(400).json({ success: false, message: 'Keyword is required' }); return; }
        result = await keywordResearch.getLongTailVariations(keyword);
        break;
      case 'competition':
        if (!keyword) { res.status(400).json({ success: false, message: 'Keyword is required' }); return; }
        result = await keywordResearch.analyzeCompetition(keyword);
        break;
      case 'questions':
        if (!keyword) { res.status(400).json({ success: false, message: 'Keyword is required' }); return; }
        result = await keywordResearch.getQuestions(keyword);
        break;
      case 'intent':
        if (!keyword) { res.status(400).json({ success: false, message: 'Keyword is required' }); return; }
        result = await keywordResearch.analyzeSearchIntent(keyword);
        break;
      case 'suggestions':
        if (!seed) { res.status(400).json({ success: false, message: 'Seed keyword is required' }); return; }
        result = await keywordResearch.getKeywordSuggestions(seed);
        break;
      default:
        res.status(400).json({ success: false, message: `Unknown action: ${action}` });
        return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Keyword research failed' });
  }
});

router.post('/competitors', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = req.organizationId!;
    const { action, domain, competitor, competitorId, pageUrl } = req.body;
    if (!action) {
      res.status(400).json({ success: false, message: 'Action is required (analyze, track, insights, compare, recommendations)' });
      return;
    }
    let result: any;
    switch (action) {
      case 'analyze':
        if (!domain) { res.status(400).json({ success: false, message: 'Domain is required' }); return; }
        result = await competitorAnalysis.analyzeCompetitor(domain);
        break;
      case 'track':
        if (!competitor) { res.status(400).json({ success: false, message: 'Competitor data is required' }); return; }
        result = await competitorAnalysis.trackCompetitor(orgId, competitor);
        break;
      case 'insights':
        if (!competitorId) { res.status(400).json({ success: false, message: 'Competitor ID is required' }); return; }
        result = await competitorAnalysis.getCompetitorInsights(orgId, competitorId);
        break;
      case 'compare':
        if (!pageUrl) { res.status(400).json({ success: false, message: 'Page URL is required' }); return; }
        result = await competitorAnalysis.compareWithCompetitors(orgId, pageUrl);
        break;
      case 'recommendations':
        if (!competitorId) { res.status(400).json({ success: false, message: 'Competitor ID is required' }); return; }
        result = await competitorAnalysis.generateRecommendations(orgId, competitorId);
        break;
      default:
        res.status(400).json({ success: false, message: `Unknown action: ${action}` });
        return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Competitor analysis failed' });
  }
});

export default router;
