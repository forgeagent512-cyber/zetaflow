export class AuditService {
    async log(supabase, entry) {
        try {
            await supabase.from('audit_logs').insert({
                organization_id: entry.organizationId,
                user_id: entry.userId,
                action: entry.action,
                resource: entry.resource,
                resource_id: entry.resourceId,
                details: entry.details ?? {},
                ip_address: entry.ipAddress,
                user_agent: entry.userAgent,
                created_at: new Date().toISOString(),
            });
        }
        catch {
            // Non-blocking - audit failures should not break the app
        }
    }
    async query(supabase, options) {
        let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (options.organizationId)
            query = query.eq('organization_id', options.organizationId);
        if (options.userId)
            query = query.eq('user_id', options.userId);
        if (options.action)
            query = query.eq('action', options.action);
        const { data } = await query.range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50) - 1);
        return data ?? [];
    }
}
