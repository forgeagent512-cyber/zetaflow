import { createClient } from '@supabase/supabase-js';
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
export class OrganizationManager {
    async getOrganizations(filters) {
        const supabase = getSupabase();
        let query = supabase.from('organizations').select('*').order('created_at', { ascending: false });
        if (filters?.plan)
            query = query.eq('plan', filters.plan);
        if (filters?.status)
            query = query.eq('status', filters.status);
        if (filters?.search)
            query = query.ilike('name', `%${filters.search}%`);
        if (filters?.limit) {
            query = query.range(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit - 1);
        }
        const { data } = await query;
        return (data ?? []).map(this.mapRow);
    }
    async getOrganization(id) {
        const supabase = getSupabase();
        const { data } = await supabase.from('organizations').select('*').eq('id', id).single();
        return data ? this.mapRow(data) : null;
    }
    async updateOrganization(id, data) {
        const supabase = getSupabase();
        const payload = {};
        if (data.name !== undefined)
            payload.name = data.name;
        if (data.plan !== undefined)
            payload.plan = data.plan;
        if (data.features !== undefined)
            payload.features = data.features;
        if (data.whiteLabel !== undefined)
            payload.white_label = data.whiteLabel;
        if (data.status !== undefined)
            payload.status = data.status;
        payload.updated_at = new Date().toISOString();
        const { data: result, error } = await supabase.from('organizations').update(payload).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        return this.mapRow(result);
    }
    async deleteOrganization(id) {
        const supabase = getSupabase();
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async getOrganizationUsers(orgId) {
        const supabase = getSupabase();
        const { data } = await supabase.from('organization_users').select('user_id, role, users!inner(id, email)').eq('organization_id', orgId);
        return (data ?? []).map((r) => ({
            id: r.users?.id ?? r.user_id,
            email: r.users?.email ?? '',
            role: r.role,
        }));
    }
    async getOrganizationUsage(orgId) {
        const supabase = getSupabase();
        const [employees, deployments, workflows] = await Promise.all([
            supabase.from('ai_employees').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
            supabase.from('deployments').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
            supabase.from('workflows').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        ]);
        return {
            aiEmployees: employees.count ?? 0,
            deployments: deployments.count ?? 0,
            workflows: workflows.count ?? 0,
        };
    }
    async getOrganizationBilling(orgId) {
        const supabase = getSupabase();
        const { data: invoices } = await supabase.from('invoices').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(10);
        const { data: subscription } = await supabase.from('subscriptions').select('*').eq('organization_id', orgId).single();
        return { invoices: invoices ?? [], subscription: subscription ?? null };
    }
    async getOrganizationDeployments(orgId) {
        const supabase = getSupabase();
        const { data } = await supabase.from('deployments').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
        return data ?? [];
    }
    mapRow(row) {
        return {
            id: row.id,
            name: row.name,
            plan: row.plan,
            features: row.features ?? [],
            whiteLabel: row.white_label ?? false,
            status: row.status ?? 'active',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
