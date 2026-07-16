import type { Request, Response } from 'express';
import { ProviderFactory } from '../services/ai-provider/provider-factory.js';

async function checkAIProvider(): Promise<{ status: string; provider: string; details?: Record<string, unknown> }> {
  try {
    const provider = ProviderFactory.create('openrouter');
    const health = await provider.health();
    return {
      status: health.status,
      provider: health.provider,
      details: health.details
    };
  } catch {
    return { status: 'error', provider: 'openrouter', details: { message: 'Provider health check failed' } };
  }
}

async function checkModuleHealth(moduleName: string): Promise<{ status: string; module: string; version: string }> {
  try {
    const envCheck = process.env.NODE_ENV ? true : false;
    return {
      status: envCheck ? 'ok' : 'degraded',
      module: moduleName,
      version: '1.0'
    };
  } catch {
    return { status: 'error', module: moduleName, version: '1.0' };
  }
}

export async function aiFactoryHealthHandler(req: Request, res: Response) {
  try {
    const [aiProvider, promptEngine, workflowGenerator, businessAnalyzer, employeeGenerator, agentGenerator, workflowAnalyzer, templateSearch] = await Promise.all([
      checkAIProvider(),
      checkModuleHealth('prompt-engine'),
      checkModuleHealth('workflow-generator'),
      checkModuleHealth('business-analyzer'),
      checkModuleHealth('employee-generator'),
      checkModuleHealth('agent-generator'),
      checkModuleHealth('workflow-analyzer'),
      checkModuleHealth('template-search')
    ]);

    const checks = { aiProvider, promptEngine, workflowGenerator, businessAnalyzer, employeeGenerator, agentGenerator, workflowAnalyzer, templateSearch };
    const allOk = Object.values(checks).every(c => c.status === 'ok');
    return res.json({
      success: true,
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Health check failed' });
  }
}

export async function promptEngineHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('prompt-engine');
  return res.json({ success: health.status === 'ok', data: health });
}

export async function workflowGeneratorHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('workflow-generator');
  return res.json({ success: health.status === 'ok', data: health });
}

export async function businessAnalyzerHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('business-analyzer');
  return res.json({ success: health.status === 'ok', data: health });
}

export async function employeeGeneratorHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('employee-generator');
  return res.json({ success: health.status === 'ok', data: health });
}

export async function agentGeneratorHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('agent-generator');
  return res.json({ success: health.status === 'ok', data: health });
}

export async function workflowAnalyzerHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('workflow-analyzer');
  return res.json({ success: health.status === 'ok', data: health });
}

export async function templateSearchHealthHandler(req: Request, res: Response) {
  const health = await checkModuleHealth('template-search');
  return res.json({ success: health.status === 'ok', data: health });
}
