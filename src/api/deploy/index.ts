import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { OneClickDeployService } from '../../services/deployment/one-click-deploy.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const deployService = new OneClickDeployService();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.post('/validate-credentials', authenticate, async (req: Request, res: Response) => {
  try {
    const { credentials } = req.body;
    if (!credentials) {
      res.status(400).json({ success: false, message: 'Credentials required' });
      return;
    }
    const result = await deployService.validateCredentials(credentials);
    res.json({ success: result.valid, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Validation failed' });
  }
});

router.post('/one-click', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const result = await deployService.deploy(supabase, {
      organizationId: req.organizationId!,
      templateId: req.body.templateId,
      credentials: req.body.credentials ?? {},
      environment: req.body.environment,
    });
    res.status(result.success ? 200 : 400).json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Deployment failed' });
  }
});

export default router;
