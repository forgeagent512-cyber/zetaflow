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

router.post('/export', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { entities, format = 'json' } = req.body;
    if (!entities || !Array.isArray(entities) || entities.length === 0) {
      res.status(400).json({ success: false, message: 'Entities array is required' });
      return;
    }
    const exportData: Record<string, any[]> = {};
    for (const entity of entities) {
      const { data, error } = await supabase.from(entity).select('*').eq('organization_id', orgId);
      if (!error) exportData[entity] = data ?? [];
    }
    const jobId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await supabase.from('export_jobs').insert({
      id: jobId, organization_id: orgId, entities, format, status: 'completed',
      completed_at: new Date().toISOString(),
    });
    if (format === 'csv') {
      const csvLines: string[] = [];
      for (const [entity, records] of Object.entries(exportData)) {
        if (records.length > 0) {
          csvLines.push(`# ${entity}`);
          csvLines.push(Object.keys(records[0]).join(','));
          for (const record of records) {
            csvLines.push(Object.values(record).map((v: any) => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(','));
          }
        }
      }
      res.json({ success: true, data: { jobId, format, data: csvLines.join('\n') } });
    } else {
      res.json({ success: true, data: { jobId, format, data: exportData } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Export failed' });
  }
});

router.post('/import', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { entity, data, strategy = 'insert' } = req.body;
    if (!entity || !data || !Array.isArray(data)) {
      res.status(400).json({ success: false, message: 'Entity and data array are required' });
      return;
    }
    const results = { total: data.length, imported: 0, errors: 0, errorDetails: [] as string[] };
    for (const record of data) {
      record.organization_id = orgId;
      try {
        let result;
        if (strategy === 'upsert' && record.id) {
          result = await supabase.from(entity).upsert(record).select().single();
        } else {
          result = await supabase.from(entity).insert(record).select().single();
        }
        if (result.error) {
          results.errors++;
          results.errorDetails.push(result.error.message);
        } else {
          results.imported++;
        }
      } catch (err) {
        results.errors++;
        results.errorDetails.push(err instanceof Error ? err.message : 'Unknown error');
      }
    }
    const jobId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await supabase.from('import_jobs').insert({
      id: jobId, organization_id: orgId, entity, strategy, status: 'completed',
      total: results.total, imported: results.imported, errors: results.errors,
      completed_at: new Date().toISOString(),
    });
    res.json({ success: true, data: { jobId, ...results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Import failed' });
  }
});

router.get('/jobs/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { data, error } = await supabase.from('import_jobs').select('*').eq('id', id).eq('organization_id', orgId).single();
    if (error) {
      const { data: exportJob, error: exportError } = await supabase.from('export_jobs').select('*').eq('id', id).eq('organization_id', orgId).single();
      if (exportError) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      res.json({ success: true, data: exportJob });
      return;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get job status' });
  }
});

export default router;
