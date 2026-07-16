import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PromptManager } from '../../services/ai-orchestrator/prompt-manager.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const promptManager = new PromptManager();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { category, search, page = '1', limit = '20' } = req.query;
    let query = supabase.from('prompts').select('*', { count: 'exact' }).eq('organization_id', orgId);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);
    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [], total: count ?? 0, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list prompts' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { name, content, category, variables, description } = req.body;
    if (!name || !content) {
      res.status(400).json({ success: false, message: 'Name and content are required' });
      return;
    }
    const { data, error } = await supabase.from('prompts').insert({
      organization_id: orgId, name, content, category, variables, description, version: 1,
    }).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create prompt' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { data, error } = await supabase.from('prompts').select('*').eq('id', id).eq('organization_id', orgId).single();
    if (error) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get prompt' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { name, content, category, variables, description } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (variables !== undefined) updates.variables = variables;
    if (description !== undefined) updates.description = description;
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('prompts').update(updates).eq('id', id).eq('organization_id', orgId).select().single();
    if (error) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update prompt' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { error } = await supabase.from('prompts').delete().eq('id', id).eq('organization_id', orgId);
    if (error) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, message: 'Prompt deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete prompt' });
  }
});

router.get('/:id/versions', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { data, error } = await supabase.from('prompt_versions').select('*').eq('prompt_id', id).eq('organization_id', orgId).order('version', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get versions' });
  }
});

router.post('/:id/versions', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { content, variables } = req.body;
    if (!content) {
      res.status(400).json({ success: false, message: 'Content is required' });
      return;
    }
    const { data: prompt } = await supabase.from('prompts').select('version').eq('id', id).eq('organization_id', orgId).single();
    if (!prompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    const nextVersion = prompt.version + 1;
    const { data, error } = await supabase.from('prompt_versions').insert({
      prompt_id: id, organization_id: orgId, version: nextVersion, content, variables,
    }).select().single();
    if (error) throw new Error(error.message);
    await supabase.from('prompts').update({ version: nextVersion, updated_at: new Date().toISOString() }).eq('id', id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create version' });
  }
});

router.post('/:id/rollback', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { version } = req.body;
    if (!version) {
      res.status(400).json({ success: false, message: 'Version number is required' });
      return;
    }
    const { data: versionData, error: versionError } = await supabase.from('prompt_versions').select('*').eq('prompt_id', id).eq('organization_id', orgId).eq('version', version).single();
    if (versionError || !versionData) {
      res.status(404).json({ success: false, message: 'Version not found' });
      return;
    }
    const { data, error } = await supabase.from('prompts').update({
      content: versionData.content, variables: versionData.variables, version, updated_at: new Date().toISOString(),
    }).eq('id', id).eq('organization_id', orgId).select().single();
    if (error) throw new Error(error.message);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to rollback prompt' });
  }
});

router.post('/:id/test', authenticate, async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const orgId = req.organizationId!;
    const { id } = req.params;
    const { variables } = req.body;
    const { data: prompt, error } = await supabase.from('prompts').select('*').eq('id', id).eq('organization_id', orgId).single();
    if (error || !prompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    const result = await promptManager.testPrompt(prompt.content, variables ?? {});
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Prompt test failed' });
  }
});

export default router;
