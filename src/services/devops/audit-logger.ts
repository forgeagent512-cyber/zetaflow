import { createClient } from '@supabase/supabase-js';
import type { AuditLogEntry } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface AuditLogFilters {
  action?: string;
  resourceType?: string;
  userId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class AuditLogger {
  async log(entry: AuditLogEntry, req?: { ip?: string; headers?: Record<string, string> }): Promise<void> {
    const supabase = getSupabase();
    try {
      await supabase.from('audit_logs').insert({
        id: crypto.randomUUID(),
        organization_id: entry.organizationId,
        user_id: entry.userId,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        details: entry.details ?? {},
        ip_address: entry.ipAddress ?? req?.ip,
        user_agent: entry.userAgent ?? req?.headers?.['user-agent'],
        severity: entry.severity ?? 'info',
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-blocking
    }
  }

  async getLogs(orgId: string, filters?: AuditLogFilters): Promise<any[]> {
    const supabase = getSupabase();
    let query = supabase.from('audit_logs').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.resourceType) query = query.eq('resource_type', filters.resourceType);
    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.severity) query = query.eq('severity', filters.severity);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const { data } = await query.range(offset, offset + limit - 1);
    return (data ?? []).map(this.mapRow);
  }

  async getSystemLogs(filters?: AuditLogFilters): Promise<any[]> {
    const supabase = getSupabase();
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.severity) query = query.eq('severity', filters.severity);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);
    const limit = filters?.limit ?? 100;
    const offset = filters?.offset ?? 0;
    const { data } = await query.range(offset, offset + limit - 1);
    return (data ?? []).map(this.mapRow);
  }

  async getUserActivity(userId: string): Promise<any[]> {
    const supabase = getSupabase();
    const { data } = await supabase.from('audit_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
    return (data ?? []).map(this.mapRow);
  }

  private mapRow(row: any): AuditLogEntry & { id: string; createdAt: string } {
    return {
      id: row.id,
      userId: row.user_id,
      organizationId: row.organization_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      severity: row.severity,
      createdAt: row.created_at,
    };
  }
}
