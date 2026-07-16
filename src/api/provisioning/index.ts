import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { ProvisioningEngine } from '../../services/devops/provisioning-engine.js';

const router = Router();
const provisioningEngine = new ProvisioningEngine();

router.post('/provision', authenticate, requireRole('Super Admin', 'Organization Admin'), async (req: Request, res: Response) => {
  try {
    const result = await provisioningEngine.provisionClient(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Provisioning failed' });
  }
});

router.get('/status/:orgId', authenticate, async (req: Request, res: Response) => {
  try {
    const status = await provisioningEngine.getProvisioningStatus(req.params.orgId as string);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get provisioning status' });
  }
});

export default router;
