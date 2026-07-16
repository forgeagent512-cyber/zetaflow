import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.post('/checklist', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { type } = req.body;
    const items = [
      { id: 'domain-configured', label: 'Custom domain configured', category: 'infrastructure', status: false },
      { id: 'ssl-enabled', label: 'SSL certificate enabled', category: 'infrastructure', status: false },
      { id: 'ai-providers', label: 'AI providers connected', category: 'integration', status: false },
      { id: 'content-ready', label: 'Content templates ready', category: 'content', status: false },
      { id: 'seo-basics', label: 'SEO basics configured', category: 'seo', status: false },
      { id: 'analytics', label: 'Analytics tracking active', category: 'monitoring', status: false },
      { id: 'email-configured', label: 'Email service configured', category: 'communication', status: false },
      { id: 'backup-plan', label: 'Backup schedule set', category: 'operations', status: false },
      { id: 'users-invited', label: 'Team users invited', category: 'team', status: false },
      { id: 'branding', label: 'Branding applied', category: 'appearance', status: false },
    ];
    try {
      const { data: saved } = await supabase.from('launch_checklists').select('*').eq('organization_id', orgId);
      if (saved) {
        for (const item of items) {
          const savedItem = saved.find((s: any) => s.item_id === item.id);
          if (savedItem) item.status = savedItem.status;
        }
      }
    } catch {
    }
    res.json({ success: true, data: { items, total: items.length, completed: items.filter(i => i.status).length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Checklist retrieval failed' });
  }
});

router.post('/health-check', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const checks: Record<string, any> = {};
    const dbResult = await supabase.from('_health').select('1').limit(1).maybeSingle();
    checks.database = { status: dbResult.error ? 'fail' : 'pass', message: dbResult.error ? dbResult.error.message : 'Connected' };
    checks.api = { status: 'pass', message: 'API responding' };
    checks.configuration = { status: 'pass', message: 'Configuration loaded' };
    const overall = Object.values(checks).every((c: any) => c.status === 'pass') ? 'pass' : 'fail';
    res.json({ success: true, data: { overall, checks, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Health check failed' });
  }
});

router.post('/generate-report', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { checklist, healthCheck } = req.body;
    let reportData: any = { organizationId: orgId, generatedAt: new Date().toISOString(), status: 'unknown', sections: [] };
    if (checklist) {
      const completedItems = (checklist.items ?? []).filter((i: any) => i.status);
      reportData.sections.push({ name: 'Launch Checklist', totalItems: checklist.total ?? 0, completedItems: completedItems.length, completionRate: `${Math.round((completedItems.length / (checklist.total || 1)) * 100)}%` });
    }
    if (healthCheck) {
      const allPass = Object.values(healthCheck.checks ?? {}).every((c: any) => c.status === 'pass');
      reportData.sections.push({ name: 'Health Check', status: allPass ? 'All systems pass' : 'Issues detected', checks: healthCheck.checks });
    }
    const allHealthy = reportData.sections.every((s: any) => !s.status || s.status === 'All systems pass' || (s.completionRate && parseInt(s.completionRate) >= 80));
    reportData.status = allHealthy ? 'ready' : 'needs-attention';
    reportData.recommendations = [];
    if (!allHealthy) reportData.recommendations.push('Complete remaining checklist items and resolve health check issues before launch.');
    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Report generation failed' });
  }
});

router.get('/readiness/:orgId', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const { orgId } = req.params;
    const { data: org } = await supabase.from('organizations').select('name, slug, status').eq('id', orgId).single();
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }
    const { data: deployments } = await supabase.from('deployments').select('status').eq('organization_id', orgId).limit(1);
    const { data: settings } = await supabase.from('white_label_settings').select('brand_name, custom_domain').eq('organization_id', orgId).maybeSingle();
    const readiness = {
      organization: { name: org.name, slug: org.slug, status: org.status },
      domainConfigured: !!(settings?.custom_domain || settings?.brand_name),
      hasDeployments: (deployments?.length ?? 0) > 0,
      score: 0,
      recommendations: [] as string[],
    };
    let score = 0;
    if (org.status === 'active') score += 30;
    if (readiness.domainConfigured) score += 30;
    if (readiness.hasDeployments) score += 40;
    readiness.score = score;
    if (score < 60) readiness.recommendations.push('Configure your custom domain and create your first deployment.');
    else if (score < 100) readiness.recommendations.push('Complete remaining setup for full launch readiness.');
    else readiness.recommendations.push('Organization is ready for launch.');
    res.json({ success: true, data: readiness });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Readiness check failed' });
  }
});

export default router;
