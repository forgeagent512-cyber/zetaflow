import type { Request, Response, NextFunction } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

export function tenantContext(supabase: SupabaseClient) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const organizationId = req.headers['x-organization-id'] as string | undefined;
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
    } catch (error) {
      res.status(500).json({ success: false, message: 'Tenant verification failed' });
    }
  };
}

export function enforceOrgIsolation(tableName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new Error('Organization context not set');
    }

    res.locals.organizationId = orgId;
    next();
  };
}
