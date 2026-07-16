import { Router } from 'express';
import type { Request, Response } from 'express';
import { BillingService, PLANS } from '../../services/billing/billing.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const billingService = new BillingService();

router.get('/plans', (_req: Request, res: Response) => {
  res.json({ success: true, data: { plans: PLANS } });
});

router.post('/create-checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    if (!planId || !successUrl || !cancelUrl) {
      res.status(400).json({ success: false, message: 'planId, successUrl, and cancelUrl required' });
      return;
    }

    const result = await billingService.createCheckoutSession(req.organizationId!, planId, successUrl, cancelUrl);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Checkout failed' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const raw = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
    const result = await billingService.handleWebhook(raw, sig);
    res.json(result);
  } catch {
    res.status(400).json({ received: false });
  }
});

router.get('/invoices', authenticate, async (req: Request, res: Response) => {
  try {
    const invoices = await billingService.getInvoices(req.organizationId!);
    res.json({ success: true, data: { invoices } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

router.get('/active-plan', authenticate, async (req: Request, res: Response) => {
  try {
    const plan = await billingService.getActivePlan(req.organizationId!);
    res.json({ success: true, data: { plan } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch active plan' });
  }
});

export default router;
