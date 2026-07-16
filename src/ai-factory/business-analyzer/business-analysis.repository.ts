import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repository } from '../shared/repositories.js';
import type { BusinessAnalysisRecord } from './business-analysis.types.js';

export interface BusinessAnalysisRepository extends Repository<BusinessAnalysisRecord> {
  findByOrganizationId(organizationId: string): Promise<BusinessAnalysisRecord[]>;
}

export class SupabaseBusinessAnalysisRepository implements BusinessAnalysisRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<BusinessAnalysisRecord | null> {
    const { data, error } = await this.supabase.from('business_analysis').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as BusinessAnalysisRecord | null;
  }

  async save(entity: BusinessAnalysisRecord): Promise<BusinessAnalysisRecord> {
    const payload = {
      id: entity.id,
      organization_id: entity.organizationId,
      request: entity.request,
      analysis: entity.analysis,
      confidence: entity.confidence,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };

    const { data, error } = await this.supabase.from('business_analysis').insert(payload).select('*').single();
    if (error) throw error;
    return data as BusinessAnalysisRecord;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('business_analysis').delete().eq('id', id);
    if (error) throw error;
  }

  async findByOrganizationId(organizationId: string): Promise<BusinessAnalysisRecord[]> {
    const { data, error } = await this.supabase.from('business_analysis').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as BusinessAnalysisRecord[];
  }
}
