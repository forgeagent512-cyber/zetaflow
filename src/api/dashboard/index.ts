import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { DashboardService } from '../../services/dashboard/dashboard.service.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();
const dashboardService = new DashboardService();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.get('/client', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const data = await dashboardService.getClientDashboard(supabase, req.organizationId!);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Dashboard fetch failed' });
  }
});

router.get('/admin', authenticate, requireRole('Super Admin', 'Organization Admin'), async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const data = await dashboardService.getAdminDashboard(supabase);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Admin dashboard fetch failed' });
  }
});

export default router;
