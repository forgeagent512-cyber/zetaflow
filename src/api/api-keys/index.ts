import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function generateApiKey(): { rawKey: string; keyHash: string } {
  const rawKey = `bag_${randomBytes(24).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  return { rawKey, keyHash };
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { data, error } = await supabase.from('api_keys').select('id, name, key_prefix, created_at, last_used_at, is_active').eq('organization_id', orgId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list API keys' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { name, permissions } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Name is required' });
      return;
    }
    const { rawKey, keyHash } = generateApiKey();
    const keyPrefix = rawKey.substring(0, 8);
    const { data, error } = await supabase.from('api_keys').insert({
      organization_id: orgId, name, key: keyHash, key_prefix: keyPrefix,
      permissions: permissions ?? ['read'], is_active: true,
    }).select('id, name, key_prefix, created_at, is_active').single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data: { ...data, key: rawKey } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to generate API key' });
  }
});

router.post('/:id/rotate', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { rawKey: newKey, keyHash: newKeyHash } = generateApiKey();
    const keyPrefix = newKey.substring(0, 8);
    const { data, error } = await supabase.from('api_keys').update({
      key: newKeyHash, key_prefix: keyPrefix, rotated_at: new Date().toISOString(),
    }).eq('id', id).eq('organization_id', orgId).select('id, name, key_prefix, created_at, rotated_at, is_active').single();
    if (error) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }
    res.json({ success: true, data: { ...data, key: newKey } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to rotate API key' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { error } = await supabase.from('api_keys').delete().eq('id', id).eq('organization_id', orgId);
    if (error) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to revoke API key' });
  }
});

router.get('/:id/usage', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { period = '7d' } = req.query;
    const { data, error } = await supabase.from('api_key_usage').select('*').eq('api_key_id', id).eq('organization_id', orgId).gte('timestamp', new Date(Date.now() - parsePeriod(period as string)).toISOString()).order('timestamp', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get API key usage' });
  }
});

function parsePeriod(period: string): number {
  const match = period.match(/^(\d+)([dhwm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  switch (match[2]) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    case 'm': return value * 30 * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

export default router;
