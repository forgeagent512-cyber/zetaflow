import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repository } from '../shared/repositories.js';
import type { GeneratedEmployeeRecord } from './employee-generator.types.js';

export interface EmployeeRepository extends Repository<GeneratedEmployeeRecord> {
  findByOrganizationId(organizationId: string): Promise<GeneratedEmployeeRecord[]>;
  findByName(employeeName: string): Promise<GeneratedEmployeeRecord | null>;
}

export class SupabaseEmployeeRepository implements EmployeeRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<GeneratedEmployeeRecord | null> {
    const { data, error } = await this.supabase.from('ai_employees').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as GeneratedEmployeeRecord | null;
  }

  async save(entity: GeneratedEmployeeRecord): Promise<GeneratedEmployeeRecord> {
    const payload = {
      id: entity.id,
      organization_id: entity.organizationId,
      employee_name: entity.employeeName,
      department: entity.department,
      industry: entity.industry,
      system_prompt: entity.systemPrompt,
      employee_json: entity.employeeJson,
      status: entity.status,
      version: entity.version,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };

    const { data, error } = await this.supabase.from('ai_employees').insert(payload).select('*').single();
    if (error) throw error;
    return data as GeneratedEmployeeRecord;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('ai_employees').delete().eq('id', id);
    if (error) throw error;
  }

  async findByOrganizationId(organizationId: string): Promise<GeneratedEmployeeRecord[]> {
    const { data, error } = await this.supabase.from('ai_employees').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as GeneratedEmployeeRecord[];
  }

  async findByName(employeeName: string): Promise<GeneratedEmployeeRecord | null> {
    const { data, error } = await this.supabase.from('ai_employees').select('*').eq('employee_name', employeeName).maybeSingle();
    if (error) throw error;
    return data as GeneratedEmployeeRecord | null;
  }
}
