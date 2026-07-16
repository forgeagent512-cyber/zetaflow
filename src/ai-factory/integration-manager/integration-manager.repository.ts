import type { SupabaseClient } from '@supabase/supabase-js';
import type { IntegrationRecord, IntegrationRepository } from './integration-manager.types.js';

export class SupabaseIntegrationRepository implements IntegrationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<IntegrationRecord | null> {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find integration: ${error.message}`);
    }

    if (!data) return null;

    return this.mapToRecord(data);
  }

  async findByOrganizationId(organizationId: string): Promise<IntegrationRecord[]> {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list integrations: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToRecord(row));
  }

  async save(record: IntegrationRecord): Promise<IntegrationRecord> {
    const payload = {
      id: record.id,
      organization_id: record.organizationId,
      name: record.name,
      provider: record.provider,
      status: record.status,
      encrypted_credentials: record.encryptedCredentials,
      health_status: record.healthStatus,
      last_health_check_at: record.lastHealthCheckAt,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    };

    const { data, error } = await this.supabase
      .from('integrations')
      .upsert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to save integration: ${error.message}`);
    }

    return this.mapToRecord(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete integration: ${error.message}`);
    }

    return true;
  }

  private mapToRecord(row: any): IntegrationRecord {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      provider: row.provider,
      status: row.status,
      encryptedCredentials: row.encrypted_credentials,
      healthStatus: row.health_status,
      lastHealthCheckAt: row.last_health_check_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
