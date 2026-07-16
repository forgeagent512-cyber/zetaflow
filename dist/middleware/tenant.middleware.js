export function tenantContext(supabase) {
    return async (req, res, next) => {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.user?.userId;
        const userOrgId = req.user?.organizationId;
        const orgId = userOrgId || organizationId;
        if (!orgId) {
            res.status(400).json({ success: false, message: 'Organization ID is required' });
            return;
        }
        try {
            const { data: org, error } = await supabase
                .from('organizations')
                .select('id, is_active, subscription_status')
                .eq('id', orgId)
                .maybeSingle();
            if (error || !org) {
                res.status(404).json({ success: false, message: 'Organization not found' });
                return;
            }
            if (!org.is_active) {
                res.status(403).json({ success: false, message: 'Organization is deactivated' });
                return;
            }
            if (org.subscription_status === 'past_due' || org.subscription_status === 'canceled') {
                res.status(402).json({ success: false, message: 'Payment required. Please update your subscription.' });
                return;
            }
            req.organizationId = org.id;
            next();
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Tenant verification failed' });
        }
    };
}
export function enforceOrgIsolation(tableName) {
    return (req, res, next) => {
        const orgId = req.organizationId;
        if (!orgId) {
            throw new Error('Organization context not set');
        }
        res.locals.organizationId = orgId;
        next();
    };
}
