import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

const ALLOWED_ENTITIES = ['ai_employees', 'deployments', 'workflows', 'configurations', 'white_label_settings', 'credentials', 'feature_flags'];

export class ImportExportService {
  async exportEntity(orgId: string, entityType: string, ids: string[]): Promise<string> {
    if (!ALLOWED_ENTITIES.includes(entityType)) {
      throw new Error(`Entity type '${entityType}' is not exportable`);
    }
    const supabase = getSupabase();
    const jobId = crypto.randomUUID();
    await supabase.from('import_export_jobs').insert({
      id: jobId,
      organization_id: orgId,
      type: 'export',
      entity_type: entityType,
      status: 'processing',
      created_at: new Date().toISOString(),
    });
    this.processExport(jobId, orgId, entityType, ids).catch(() => {});
    return jobId;
  }

  private async processExport(jobId: string, orgId: string, entityType: string, ids: string[]): Promise<void> {
    const supabase = getSupabase();
    try {
      let query = supabase.from(entityType).select('*').eq('organization_id', orgId);
      if (ids.length > 0) query = query.in('id', ids);
      const { data } = await query;
      const output = JSON.stringify(data ?? [], null, 2);
      const { error: storageError } = await supabase.storage.from('exports').upload(`${orgId}/${jobId}.json`, output, { contentType: 'application/json' });
      if (storageError) throw storageError;
      await supabase.from('import_export_jobs').update({
        status: 'completed',
        file_path: `${orgId}/${jobId}.json`,
        record_count: (data ?? []).length,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    } catch (error) {
      await supabase.from('import_export_jobs').update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Export failed',
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    }
  }

  async importEntity(orgId: string, entityType: string, data: any[]): Promise<string> {
    if (!ALLOWED_ENTITIES.includes(entityType)) {
      throw new Error(`Entity type '${entityType}' is not importable`);
    }
    const supabase = getSupabase();
    const jobId = crypto.randomUUID();
    await supabase.from('import_export_jobs').insert({
      id: jobId,
      organization_id: orgId,
      type: 'import',
      entity_type: entityType,
      status: 'processing',
      created_at: new Date().toISOString(),
    });
    this.processImport(jobId, orgId, entityType, data).catch(() => {});
    return jobId;
  }

  private async processImport(jobId: string, orgId: string, entityType: string, records: any[]): Promise<void> {
    const supabase = getSupabase();
    try {
      let imported = 0;
      for (const record of records) {
        const payload = { ...record, organization_id: orgId, id: record.id ?? crypto.randomUUID() };
        const { error } = await supabase.from(entityType).upsert(payload).eq('id', payload.id);
        if (!error) imported++;
      }
      await supabase.from('import_export_jobs').update({
        status: 'completed',
        record_count: imported,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    } catch (error) {
      await supabase.from('import_export_jobs').update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Import failed',
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    }
  }

  async exportAll(orgId: string): Promise<string> {
    const supabase = getSupabase();
    const jobId = crypto.randomUUID();
    await supabase.from('import_export_jobs').insert({
      id: jobId,
      organization_id: orgId,
      type: 'export_all',
      status: 'processing',
      created_at: new Date().toISOString(),
    });
    this.processExportAll(jobId, orgId).catch(() => {});
    return jobId;
  }

  private async processExportAll(jobId: string, orgId: string): Promise<void> {
    const supabase = getSupabase();
    try {
      const exportData: Record<string, any[]> = {};
      for (const entity of ALLOWED_ENTITIES) {
        const { data } = await supabase.from(entity).select('*').eq('organization_id', orgId);
        exportData[entity] = data ?? [];
      }
      const output = JSON.stringify(exportData, null, 2);
      const { error: storageError } = await supabase.storage.from('exports').upload(`${orgId}/full_${jobId}.json`, output, { contentType: 'application/json' });
      if (storageError) throw storageError;
      const totalRecords = Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0);
      await supabase.from('import_export_jobs').update({
        status: 'completed',
        file_path: `${orgId}/full_${jobId}.json`,
        record_count: totalRecords,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    } catch (error) {
      await supabase.from('import_export_jobs').update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Full export failed',
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    }
  }

  async importAll(orgId: string, data: Record<string, any[]>): Promise<string> {
    const supabase = getSupabase();
    const jobId = crypto.randomUUID();
    await supabase.from('import_export_jobs').insert({
      id: jobId,
      organization_id: orgId,
      type: 'import_all',
      status: 'processing',
      created_at: new Date().toISOString(),
    });
    this.processImportAll(jobId, orgId, data).catch(() => {});
    return jobId;
  }

  private async processImportAll(jobId: string, orgId: string, data: Record<string, any[]>): Promise<void> {
    const supabase = getSupabase();
    try {
      let totalImported = 0;
      for (const [entityType, records] of Object.entries(data)) {
        if (!ALLOWED_ENTITIES.includes(entityType)) continue;
        for (const record of records) {
          const payload = { ...record, organization_id: orgId, id: record.id ?? crypto.randomUUID() };
          const { error } = await supabase.from(entityType).upsert(payload).eq('id', payload.id);
          if (!error) totalImported++;
        }
      }
      await supabase.from('import_export_jobs').update({
        status: 'completed',
        record_count: totalImported,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    } catch (error) {
      await supabase.from('import_export_jobs').update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Full import failed',
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    }
  }

  async getExportJobStatus(jobId: string): Promise<any> {
    const supabase = getSupabase();
    const { data } = await supabase.from('import_export_jobs').select('*').eq('id', jobId).single();
    if (!data) throw new Error('Job not found');
    return {
      id: data.id,
      type: data.type,
      entityType: data.entity_type,
      status: data.status,
      filePath: data.file_path,
      recordCount: data.record_count,
      error: data.error,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  }

  async getImportJobStatus(jobId: string): Promise<any> {
    return this.getExportJobStatus(jobId);
  }
}
