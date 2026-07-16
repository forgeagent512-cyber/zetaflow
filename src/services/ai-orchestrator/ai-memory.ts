import { createSupabaseClient } from '../supabase/supabase-client.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const SHORT_TERM_RETENTION_MS = 24 * 60 * 60 * 1000;
const LONG_TERM_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_CONVERSATION_HISTORY = 100;

export class AiMemory {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase ?? createSupabaseClient();
  }

  async storeMemory(
    orgId: string,
    employeeId: string,
    type: string,
    content: string,
    metadata?: any
  ): Promise<void> {
    const { error } = await this.supabase.from('ai_memories').insert({
      id: randomUUID(),
      organization_id: orgId,
      employee_id: employeeId,
      memory_type: type,
      content,
      metadata: metadata ?? {},
      memory_tier: type === 'conversation' ? 'short_term' : 'long_term',
      created_at: new Date().toISOString(),
      expires_at: type === 'conversation'
        ? new Date(Date.now() + SHORT_TERM_RETENTION_MS).toISOString()
        : new Date(Date.now() + LONG_TERM_RETENTION_MS).toISOString()
    });

    if (error) {
      throw new Error(`Failed to store memory: ${error.message}`);
    }

    if (type === 'conversation') {
      await this.trimConversationHistory(orgId, employeeId);
    }
  }

  async recall(
    orgId: string,
    employeeId: string,
    query: string,
    limit: number = 10
  ): Promise<any[]> {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    let dbQuery = this.supabase
      .from('ai_memories')
      .select('*')
      .eq('organization_id', orgId)
      .eq('employee_id', employeeId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit * 3);

    const { data, error } = await dbQuery;

    if (error || !data) {
      return [];
    }

    const scored = data.map((row: Record<string, unknown>) => {
      const content = (row.content as string) ?? '';
      const metaStr = JSON.stringify(row.metadata ?? '');
      const searchableText = `${content} ${metaStr}`.toLowerCase();

      let score = 0;
      for (const term of searchTerms) {
        if (searchableText.includes(term)) {
          score += 1;
        }
      }

      const recencyBonus = Math.max(0, 1 - ((Date.now() - new Date(row.created_at as string).getTime()) / SHORT_TERM_RETENTION_MS));
      score += recencyBonus * 2;

      return {
        id: row.id,
        organizationId: row.organization_id,
        employeeId: row.employee_id,
        memoryType: row.memory_type,
        content: row.content,
        metadata: row.metadata,
        memoryTier: row.memory_tier,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        score
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getConversationHistory(
    orgId: string,
    employeeId: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_memories')
      .select('*')
      .eq('organization_id', orgId)
      .eq('employee_id', employeeId)
      .eq('memory_type', 'conversation')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row: Record<string, unknown>) => ({
      id: row.id,
      organizationId: row.organization_id,
      employeeId: row.employee_id,
      memoryType: row.memory_type,
      content: row.content,
      metadata: row.metadata,
      memoryTier: row.memory_tier,
      createdAt: row.created_at,
      expiresAt: row.expires_at
    }));
  }

  async cleanup(orgId: string, employeeId: string): Promise<number> {
    const now = new Date().toISOString();

    const { data: expired, error: selectError } = await this.supabase
      .from('ai_memories')
      .select('id')
      .eq('organization_id', orgId)
      .eq('employee_id', employeeId)
      .lt('expires_at', now);

    if (selectError || !expired) {
      return 0;
    }

    const expiredIds = expired.map((r: Record<string, unknown>) => r.id);

    if (expiredIds.length === 0) {
      return 0;
    }

    const batchSize = 100;
    let totalDeleted = 0;

    for (let i = 0; i < expiredIds.length; i += batchSize) {
      const batch = expiredIds.slice(i, i + batchSize);
      const { error: deleteError } = await this.supabase
        .from('ai_memories')
        .delete()
        .in('id', batch);

      if (!deleteError) {
        totalDeleted += batch.length;
      }
    }

    return totalDeleted;
  }

  async searchMemory(
    orgId: string,
    employeeId: string,
    searchTerm: string
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_memories')
      .select('*')
      .eq('organization_id', orgId)
      .eq('employee_id', employeeId)
      .gte('expires_at', new Date().toISOString())
      .textSearch('content', searchTerm, {
        type: 'websearch',
        config: 'english'
      })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) {
      return this.recall(orgId, employeeId, searchTerm, 20);
    }

    return data.map((row: Record<string, unknown>) => ({
      id: row.id,
      organizationId: row.organization_id,
      employeeId: row.employee_id,
      memoryType: row.memory_type,
      content: row.content,
      metadata: row.metadata,
      memoryTier: row.memory_tier,
      createdAt: row.created_at,
      expiresAt: row.expires_at
    }));
  }

  private async trimConversationHistory(
    orgId: string,
    employeeId: string
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from('ai_memories')
      .select('id')
      .eq('organization_id', orgId)
      .eq('employee_id', employeeId)
      .eq('memory_type', 'conversation')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return;
    }

    if (data.length > MAX_CONVERSATION_HISTORY) {
      const toDelete = data.slice(MAX_CONVERSATION_HISTORY).map((r: Record<string, unknown>) => r.id);

      const batchSize = 100;
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = toDelete.slice(i, i + batchSize);
        await this.supabase
          .from('ai_memories')
          .delete()
          .in('id', batch);
      }
    }
  }
}
