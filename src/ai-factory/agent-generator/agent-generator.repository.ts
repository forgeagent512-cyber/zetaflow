import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repository } from '../shared/repositories.js';
import type { GeneratedAgentRecord } from './agent-generator.types.js';

export interface AgentRepository extends Repository<GeneratedAgentRecord> {
  findByEmployeeId(employeeId: string): Promise<GeneratedAgentRecord[]>;
}

export class SupabaseAgentRepository implements AgentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<GeneratedAgentRecord | null> {
    const { data, error } = await this.supabase.from('ai_agents').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as GeneratedAgentRecord | null;
  }

  async save(entity: GeneratedAgentRecord): Promise<GeneratedAgentRecord> {
    const payload = {
      id: entity.id,
      organization_id: entity.organizationId,
      employee_id: entity.employeeId,
      agent_name: entity.agentName,
      agent_role: entity.agentRole,
      industry: entity.industry,
      system_prompt: entity.systemPrompt,
      agent_json: entity.agentJson,
      status: entity.status,
      version: entity.version,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };

    const { data, error } = await this.supabase.from('ai_agents').insert(payload).select('*').single();
    if (error) throw error;
    return data as GeneratedAgentRecord;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('ai_agents').delete().eq('id', id);
    if (error) throw error;
  }

  async findByEmployeeId(employeeId: string): Promise<GeneratedAgentRecord[]> {
    const { data, error } = await this.supabase.from('ai_agents').select('*').eq('employee_id', employeeId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as GeneratedAgentRecord[];
  }
}
