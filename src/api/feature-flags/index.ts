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

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { data, error } = await supabase.from('feature_flags').select('*').eq('organization_id', orgId).order('key');
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list feature flags' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { key, name, description, enabled = false } = req.body;
    if (!key || !name) {
      res.status(400).json({ success: false, message: 'Key and name are required' });
      return;
    }
    const { data, error } = await supabase.from('feature_flags').insert({
      organization_id: orgId, key, name, description, enabled,
    }).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create feature flag' });
  }
});

router.put('/:key', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { key } = req.params;
    const { name, description, enabled } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (enabled !== undefined) updates.enabled = enabled;
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('feature_flags').update(updates).eq('key', key).eq('organization_id', orgId).select().single();
    if (error) {
      res.status(404).json({ success: false, message: 'Feature flag not found' });
      return;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update feature flag' });
  }
});

router.get('/:key', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { key } = req.params;
    const { data, error } = await supabase.from('feature_flags').select('*').eq('key', key).eq('organization_id', orgId).single();
    if (error) {
      res.status(404).json({ success: false, message: 'Feature flag not found' });
      return;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get feature flag' });
  }
});

router.post('/:key/enable', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { key } = req.params;
    const { orgIds } = req.body;
    if (!orgIds || !Array.isArray(orgIds)) {
      res.status(400).json({ success: false, message: 'Organization IDs array is required' });
      return;
    }
    const records = orgIds.map((targetOrgId: string) => ({
      organization_id: targetOrgId, feature_key: key, enabled: true,
    }));
    const { data, error } = await supabase.from('feature_flag_orgs').upsert(records, { onConflict: 'organization_id,feature_key' }).select();
    if (error) throw new Error(error.message);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to enable feature flag' });
  }
});

router.post('/:key/disable', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { key } = req.params;
    const { orgIds } = req.body;
    if (!orgIds || !Array.isArray(orgIds)) {
      res.status(400).json({ success: false, message: 'Organization IDs array is required' });
      return;
    }
    const { error } = await supabase.from('feature_flag_orgs').delete().eq('feature_key', key).in('organization_id', orgIds);
    if (error) throw new Error(error.message);
    res.json({ success: true, message: 'Feature flag disabled for specified organizations' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to disable feature flag' });
  }
});

export default router;
