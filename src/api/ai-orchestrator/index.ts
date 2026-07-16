import { Router } from 'express';
import type { Request, Response } from 'express';
import { AIOrchestrator } from '../../services/ai-orchestrator/ai-orchestrator.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const orchestrator = new AIOrchestrator();

router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { prompt, context, model } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }
    const result = await orchestrator.generate(prompt, context, model);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/classify', authenticate, async (req: Request, res: Response) => {
  try {
    const { input, categories } = req.body;
    if (!input || !categories || !Array.isArray(categories)) {
      res.status(400).json({ success: false, message: 'Input and categories array are required' });
      return;
    }
    const result = await orchestrator.classify(input, categories);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Classification failed' });
  }
});

router.post('/estimate-cost', authenticate, async (req: Request, res: Response) => {
  try {
    const { model, tokens, operation } = req.body;
    if (!model || !operation) {
      res.status(400).json({ success: false, message: 'Model and operation are required' });
      return;
    }
    const cost = await orchestrator.estimateCost(model, tokens, operation);
    res.json({ success: true, data: cost });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Cost estimation failed' });
  }
});

router.post('/select-model', authenticate, async (req: Request, res: Response) => {
  try {
    const { task, requirements } = req.body;
    if (!task) {
      res.status(400).json({ success: false, message: 'Task is required' });
      return;
    }
    const model = await orchestrator.selectModel(task, requirements);
    res.json({ success: true, data: model });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Model selection failed' });
  }
});

router.post('/compare', authenticate, async (req: Request, res: Response) => {
  try {
    const { prompt, models } = req.body;
    if (!prompt || !models || !Array.isArray(models)) {
      res.status(400).json({ success: false, message: 'Prompt and models array are required' });
      return;
    }
    const comparison = await orchestrator.compare(prompt, models);
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Comparison failed' });
  }
});

router.get('/health', authenticate, async (req: Request, res: Response) => {
  try {
    const health = await orchestrator.healthCheck();
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Health check failed' });
  }
});

router.get('/providers', authenticate, async (req: Request, res: Response) => {
  try {
    const status = await orchestrator.getProviderStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get provider status' });
  }
});

router.get('/free-models', authenticate, async (req: Request, res: Response) => {
  try {
    const models = await orchestrator.getFreeModels();
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list free models' });
  }
});

export default router;
