import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

export default router;
