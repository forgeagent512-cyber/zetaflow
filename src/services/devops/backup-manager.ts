import { createClient } from '@supabase/supabase-js';
import type { BackupRecord } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export class BackupManager {
  async createBackup(orgId: string, type: BackupRecord['type']): Promise<BackupRecord> {
    const supabase = getSupabase();
    const id = crypto.randomUUID();
    const includes = ['ai_employees', 'deployments', 'workflows', 'configurations'];
    const version = `1.0.0`;

    const { error } = await supabase.from('backups').insert({
      id,
      organization_id: orgId,
      type,
      status: 'running',
      includes,
      version,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    this.processBackup(id, orgId, includes).catch(() => {});

    return {
      id,
      organizationId: orgId,
      type,
      status: 'running',
      includes,
      version,
    };
  }

  private async processBackup(id: string, orgId: string, includes: string[]): Promise<void> {
    const supabase = getSupabase();
    try {
      const backupData: Record<string, any> = {};
      for (const table of includes) {
        const { data } = await supabase.from(table).select('*').eq('organization_id', orgId);
        backupData[table] = data ?? [];
      }

      const serialized = JSON.stringify(backupData);
      const checksum = generateChecksum(serialized);
      const sizeBytes = new TextEncoder().encode(serialized).length;
      const location = `backups/${orgId}/${id}.json`;

      await supabase.from('backups').update({
        status: 'completed',
        size_bytes: sizeBytes,
        location,
        checksum,
        completed_at: new Date().toISOString(),
      }).eq('id', id);
    } catch (error) {
      await supabase.from('backups').update({
        status: 'failed',
        completed_at: new Date().toISOString(),
      }).eq('id', id);
    }
  }

  async getBackups(orgId: string): Promise<BackupRecord[]> {
    const supabase = getSupabase();
    const { data } = await supabase.from('backups').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
    return (data ?? []).map(this.mapRow);
  }

  async restoreBackup(backupId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: backup } = await supabase.from('backups').select('*').eq('id', backupId).single();
    if (!backup) throw new Error('Backup not found');
    if (backup.status !== 'completed') throw new Error('Cannot restore incomplete backup');

    const { data: content } = await supabase.storage.from('backups').download(backup.location);
    if (!content) throw new Error('Backup file not found');

    const text = await content.text();
    const backupData = JSON.parse(text) as Record<string, any>;

    for (const [table, records] of Object.entries(backupData)) {
      if (Array.isArray(records) && records.length > 0) {
        for (const record of records) {
          await supabase.from(table).upsert(record).eq('id', record.id);
        }
      }
    }

    await supabase.from('backups').update({ restored_at: new Date().toISOString() }).eq('id', backupId);
  }

  async deleteBackup(backupId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: backup } = await supabase.from('backups').select('location').eq('id', backupId).single();
    if (backup?.location) {
      await supabase.storage.from('backups').remove([backup.location]).catch(() => {});
    }
    const { error } = await supabase.from('backups').delete().eq('id', backupId);
    if (error) throw new Error(error.message);
  }

  async scheduleBackup(orgId: string, config: { frequency: 'daily' | 'weekly' | 'monthly'; time?: string; includes?: string[] }): Promise<void> {
    const supabase = getSupabase();
    const { data: existing } = await supabase.from('backup_schedules').select('id').eq('organization_id', orgId).single();
    const payload = {
      organization_id: orgId,
      frequency: config.frequency,
      time: config.time ?? '02:00',
      includes: config.includes ?? ['ai_employees', 'deployments', 'workflows', 'configurations'],
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    if (existing) {
      const { error } = await supabase.from('backup_schedules').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('backup_schedules').insert({ id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
    }
  }

  async getBackupSchedule(orgId: string): Promise<any> {
    const supabase = getSupabase();
    const { data } = await supabase.from('backup_schedules').select('*').eq('organization_id', orgId).single();
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      frequency: data.frequency,
      time: data.time,
      includes: data.includes,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapRow(row: any): BackupRecord {
    return {
      id: row.id,
      organizationId: row.organization_id,
      type: row.type,
      status: row.status,
      sizeBytes: row.size_bytes,
      location: row.location,
      includes: row.includes,
      version: row.version,
      checksum: row.checksum,
    };
  }
}
