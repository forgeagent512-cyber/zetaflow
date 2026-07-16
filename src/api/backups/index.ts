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
    const { page = '1', limit = '20' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await supabase.from('backups').select('*', { count: 'exact' }).eq('organization_id', orgId).order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [], total: count ?? 0, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list backups' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { name, type, includeData } = req.body;
    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and type are required' });
      return;
    }
    const { data, error } = await supabase.from('backups').insert({
      organization_id: orgId, name, type, include_data: includeData ?? true, status: 'pending', size: 0,
    }).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create backup' });
  }
});

router.post('/:id/restore', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { data, error } = await supabase.from('backups').update({ status: 'restoring', updated_at: new Date().toISOString() }).eq('id', id).eq('organization_id', orgId).select().single();
    if (error) {
      res.status(404).json({ success: false, message: 'Backup not found' });
      return;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to restore backup' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { error } = await supabase.from('backups').delete().eq('id', id).eq('organization_id', orgId);
    if (error) {
      res.status(404).json({ success: false, message: 'Backup not found' });
      return;
    }
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete backup' });
  }
});

export default router;
