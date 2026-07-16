import { Router } from 'express';
import type { Request, Response } from 'express';
import { SEOAnalyzer } from '../../services/seo/seo-analyzer.js';
import { SchemaGenerator } from '../../services/seo/schema-generator.js';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const seoAnalyzer = new SEOAnalyzer();
const schemaGenerator = new SchemaGenerator();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.post('/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const { url, content } = req.body;
    if (!url || !content) {
      res.status(400).json({ success: false, message: 'URL and content are required' });
      return;
    }
    const analysis = await seoAnalyzer.analyzePage(url, content);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'SEO analysis failed' });
  }
});

router.post('/generate-meta', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, keywords } = req.body;
    if (!title || !description || !keywords) {
      res.status(400).json({ success: false, message: 'Title, description, and keywords are required' });
      return;
    }
    const result = seoAnalyzer.generateMetaTags(title, description, keywords);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Meta tag generation failed' });
  }
});

router.post('/generate-schema', authenticate, async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      res.status(400).json({ success: false, message: 'Schema type and data are required' });
      return;
    }
    const method = `generate${type}` as keyof SchemaGenerator;
    if (typeof (schemaGenerator as any)[method] === 'function') {
      const schema = await (schemaGenerator as any)[method](data);
      res.json({ success: true, data: schema });
    } else {
      const schema = schemaGenerator.generateSchema(type, data);
      res.json({ success: true, data: schema });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Schema generation failed' });
  }
});

router.post('/pages', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    if (req.method === 'POST' && req.body?.action === 'create') {
      const { url, title, metaTitle, metaDescription, keywords } = req.body;
      const { data, error } = await supabase.from('seo_pages').insert({
        organization_id: orgId,
        url, title, meta_title: metaTitle, meta_description: metaDescription, keywords,
      }).select().single();
      if (error) throw new Error(error.message);
      res.json({ success: true, data });
    } else {
      const { data, error } = await supabase.from('seo_pages').select('*').eq('organization_id', orgId);
      if (error) throw new Error(error.message);
      res.json({ success: true, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'SEO pages operation failed' });
  }
});

router.post('/redirects', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    if (req.body?.action === 'create') {
      const { from, to, statusCode } = req.body;
      const { data, error } = await supabase.from('seo_redirects').insert({
        organization_id: orgId, from_url: from, to_url: to, status_code: statusCode ?? 301,
      }).select().single();
      if (error) throw new Error(error.message);
      res.json({ success: true, data });
    } else {
      const { data, error } = await supabase.from('seo_redirects').select('*').eq('organization_id', orgId);
      if (error) throw new Error(error.message);
      res.json({ success: true, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Redirects operation failed' });
  }
});

router.get('/broken-links', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { data: pages } = await supabase.from('seo_pages').select('url').eq('organization_id', orgId);
    const brokenLinks: string[] = [];
    if (pages) {
      const urls = pages.map((p: any) => p.url).filter(Boolean).slice(0, 20);
      const results = await Promise.allSettled(
        urls.map(async (url: string) => {
          try {
            const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
            if (!resp.ok) brokenLinks.push(url);
          } catch {
            brokenLinks.push(url);
          }
        })
      );
    }
    res.json({ success: true, data: { brokenLinks, totalChecked: pages?.length ?? 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Broken link check failed' });
  }
});

export default router;
