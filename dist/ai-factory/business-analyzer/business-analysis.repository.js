export class SupabaseBusinessAnalysisRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async findById(id) {
        const { data, error } = await this.supabase.from('business_analysis').select('*').eq('id', id).maybeSingle();
        if (error)
            throw error;
        return data;
    }
    async save(entity) {
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
        if (error)
            throw error;
        return data;
    }
    async delete(id) {
        const { error } = await this.supabase.from('business_analysis').delete().eq('id', id);
        if (error)
            throw error;
    }
    async findByOrganizationId(organizationId) {
        const { data, error } = await this.supabase.from('business_analysis').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
        if (error)
            throw error;
        return (data ?? []);
    }
}
