import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AutomationStoreService } from '../../services/store/automation-store.service.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();
const storeService = new AutomationStoreService();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.get('/products', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const q = req.query;
    const category = typeof q.category === 'string' ? q.category : undefined;
    const industry = typeof q.industry === 'string' ? q.industry : undefined;
    const search = typeof q.search === 'string' ? q.search : undefined;
    const products = await storeService.listProducts(supabase, { category, industry, search });
    res.json({ success: true, data: { products } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list products' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const productId = String(req.params.id);
    const product = await storeService.getProductDetail(supabase, productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get product' });
  }
});

router.post('/publish', authenticate, requireRole('Super Admin', 'Organization Admin'), async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const product = await storeService.publishProduct(supabase, req.organizationId!, req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to publish' });
  }
});

router.post('/purchase/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const purchaseId = String(req.params.productId);
    const result = await storeService.purchaseProduct(supabase, req.organizationId!, req.user!.userId, purchaseId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Purchase failed' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const categories = await storeService.getCategories(supabase);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

export default router;
