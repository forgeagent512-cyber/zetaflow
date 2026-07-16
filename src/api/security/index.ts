import { Router } from 'express';
import type { Request, Response } from 'express';
import { SecurityValidator } from '../../services/security/security-validator.js';
import { EncryptionService } from '../../services/security/encryption-service.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const securityValidator = new SecurityValidator();
const encryptionService = new EncryptionService();

router.post('/validate-input', authenticate, async (req: Request, res: Response) => {
  try {
    const { input, schema } = req.body;
    if (!input || !schema) {
      res.status(400).json({ success: false, message: 'Input and schema are required' });
      return;
    }
    const result = await securityValidator.validateInput(input, schema);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Input validation failed' });
  }
});

router.post('/detect-injection', authenticate, async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) {
      res.status(400).json({ success: false, message: 'Input is required' });
      return;
    }
    const result = await securityValidator.detectPromptInjection(input);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Injection detection failed' });
  }
});

router.post('/encrypt', authenticate, async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    if (!value) {
      res.status(400).json({ success: false, message: 'Value is required' });
      return;
    }
    const encrypted = await encryptionService.encrypt(value);
    res.json({ success: true, data: { encrypted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Encryption failed' });
  }
});

router.post('/decrypt', authenticate, async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    if (!value) {
      res.status(400).json({ success: false, message: 'Value is required' });
      return;
    }
    const decrypted = await encryptionService.decrypt(value);
    res.json({ success: true, data: { decrypted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Decryption failed' });
  }
});

export default router;
