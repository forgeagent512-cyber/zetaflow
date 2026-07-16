export class SupabaseEmployeeRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async findById(id) {
        const { data, error } = await this.supabase.from('ai_employees').select('*').eq('id', id).maybeSingle();
        if (error)
            throw error;
        return data;
    }
    async save(entity) {
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
        if (error)
            throw error;
        return data;
    }
    async delete(id) {
        const { error } = await this.supabase.from('ai_employees').delete().eq('id', id);
        if (error)
            throw error;
    }
    async findByOrganizationId(organizationId) {
        const { data, error } = await this.supabase.from('ai_employees').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
        if (error)
            throw error;
        return (data ?? []);
    }
    async findByName(employeeName) {
        const { data, error } = await this.supabase.from('ai_employees').select('*').eq('employee_name', employeeName).maybeSingle();
        if (error)
            throw error;
        return data;
    }
}
