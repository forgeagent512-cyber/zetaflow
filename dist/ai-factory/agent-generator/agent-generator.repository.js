export class SupabaseAgentRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async findById(id) {
        const { data, error } = await this.supabase.from('ai_agents').select('*').eq('id', id).maybeSingle();
        if (error)
            throw error;
        return data;
    }
    async save(entity) {
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
        if (error)
            throw error;
        return data;
    }
    async delete(id) {
        const { error } = await this.supabase.from('ai_agents').delete().eq('id', id);
        if (error)
            throw error;
    }
    async findByEmployeeId(employeeId) {
        const { data, error } = await this.supabase.from('ai_agents').select('*').eq('employee_id', employeeId).order('created_at', { ascending: false });
        if (error)
            throw error;
        return (data ?? []);
    }
}
