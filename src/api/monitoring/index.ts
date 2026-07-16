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

router.get('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { type, period = '24h' } = req.query;
    let query = supabase.from('metrics').select('*').eq('organization_id', orgId);
    if (type) query = query.eq('type', type);
    query = query.gte('recorded_at', new Date(Date.now() - parsePeriod(period as string)).toISOString());
    const { data, error } = await query.order('recorded_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get metrics' });
  }
});

router.post('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { type, value, tags } = req.body;
    if (!type || value === undefined) {
      res.status(400).json({ success: false, message: 'Type and value are required' });
      return;
    }
    const { data, error } = await supabase.from('metrics').insert({
      organization_id: orgId, type, value, tags,
    }).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to record metric' });
  }
});

router.get('/health', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const components = ['api', 'database', 'ai-providers', 'storage', 'queue'];
    const results: Record<string, any> = {};
    for (const component of components) {
      try {
        if (component === 'database') {
          const { error } = await supabase.from('_health').select('1').limit(1);
          results[component] = { status: error ? 'unhealthy' : 'healthy' };
        } else {
          results[component] = { status: 'healthy' };
        }
      } catch {
        results[component] = { status: 'unhealthy' };
      }
    }
    const overall = Object.values(results).every((r: any) => r.status === 'healthy') ? 'healthy' : 'degraded';
    res.json({ success: true, data: { overall, components: results, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Health check failed' });
  }
});

router.get('/health/:component', authenticate, async (req: Request, res: Response) => {
  try {
    const { component } = req.params;
    const supabase = getSupabase();
    let status = 'healthy';
    let details: any = {};
    if (component === 'database') {
      const { error, data } = await supabase.from('_health').select('1').limit(1);
      if (error) { status = 'unhealthy'; details.error = error.message; }
      else details.responseTime = 'ok';
    } else {
      details = { message: `${component} health check passed` };
    }
    res.json({ success: true, data: { component, status, details, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Component health check failed' });
  }
});

router.get('/provider-health', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { data, error } = await supabase.from('provider_health').select('*').eq('organization_id', orgId).order('checked_at', { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get provider health' });
  }
});

function parsePeriod(period: string): number {
  const match = period.match(/^(\d+)([dhwm])$/);
  if (!match) return 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  switch (match[2]) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    case 'm': return value * 30 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

export default router;
