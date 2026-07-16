import { createSupabaseClient } from '../supabase/supabase-client.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

interface PromptRecord {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  content: string;
  current_version: number;
  tags: string[];
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface PromptVersionRecord {
  id: string;
  prompt_id: string;
  version: number;
  content: string;
  changelog: string;
  created_by: string;
  created_at: string;
}

export class PromptManager {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase ?? createSupabaseClient();
  }

  async createPrompt(data: any): Promise<any> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const { data: prompt, error } = await this.supabase
      .from('prompts')
      .insert({
        id,
        organization_id: data.organizationId,
        name: data.name,
        description: data.description ?? '',
        content: data.content,
        current_version: 1,
        tags: data.tags ?? [],
        category: data.category ?? 'general',
        is_active: data.isActive ?? true,
        created_at: now,
        updated_at: now,
        created_by: data.createdBy ?? 'system'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create prompt: ${error.message}`);
    }

    await this.createVersion(id, data.content, 'Initial version');

    return this.mapPrompt(prompt);
  }

  async getPrompt(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Prompt not found: ${id}`);
    }

    return this.mapPrompt(data);
  }

  async getPrompts(filters: any): Promise<any[]> {
    let query = this.supabase
      .from('prompts')
      .select('*');

    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false })
      .range(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 50) - 1);

    if (error || !data) {
      return [];
    }

    return data.map((r: any) => this.mapPrompt(r));
  }

  async updatePrompt(id: string, data: any): Promise<any> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    updateData.updated_at = new Date().toISOString();

    if (data.content !== undefined) {
      const current = await this.getPrompt(id);
      updateData.current_version = current.currentVersion + 1;
    }

    const { data: updated, error } = await this.supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    if (data.content !== undefined) {
      await this.createVersion(id, data.content, data.changelog ?? 'Updated content');
    }

    return this.mapPrompt(updated);
  }

  async deletePrompt(id: string): Promise<void> {
    const { error: versionsError } = await this.supabase
      .from('prompt_versions')
      .delete()
      .eq('prompt_id', id);

    if (versionsError) {
      throw new Error(`Failed to delete prompt versions: ${versionsError.message}`);
    }

    const { error } = await this.supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }
  }

  async createVersion(promptId: string, content: string, changelog: string): Promise<any> {
    const prompt = await this.getPrompt(promptId);
    const version = prompt.currentVersion;

    const { data, error } = await this.supabase
      .from('prompt_versions')
      .insert({
        id: randomUUID(),
        prompt_id: promptId,
        version,
        content,
        changelog: changelog ?? '',
        created_by: 'system',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create version: ${error.message}`);
    }

    return {
      id: data.id,
      promptId: data.prompt_id,
      version: data.version,
      content: data.content,
      changelog: data.changelog,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async getVersions(promptId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((r: any) => ({
      id: r.id,
      promptId: r.prompt_id,
      version: r.version,
      content: r.content,
      changelog: r.changelog,
      createdBy: r.created_by,
      createdAt: r.created_at
    }));
  }

  async rollback(promptId: string, version: number): Promise<any> {
    const { data: versionData, error: versionError } = await this.supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('version', version)
      .single();

    if (versionError || !versionData) {
      throw new Error(`Version ${version} not found for prompt ${promptId}`);
    }

    const current = await this.getPrompt(promptId);

    const { data: updated, error: updateError } = await this.supabase
      .from('prompts')
      .update({
        content: versionData.content,
        current_version: current.currentVersion + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to rollback prompt: ${updateError.message}`);
    }

    await this.createVersion(promptId, versionData.content, `Rolled back to version ${version}`);

    return this.mapPrompt(updated);
  }

  async testPrompt(promptId: string, variables: any): Promise<string> {
    const prompt = await this.getPrompt(promptId);
    let rendered = prompt.content;

    if (variables && typeof variables === 'object') {
      for (const [key, value] of Object.entries(variables)) {
        rendered = rendered.replace(
          new RegExp(`{{${key}}}`, 'g'),
          String(value ?? '')
        );
        rendered = rendered.replace(
          new RegExp(`\\{${key}\\}`, 'g'),
          String(value ?? '')
        );
      }
    }

    rendered = rendered.replace(/{{[^}]+}}/g, '');
    rendered = rendered.replace(/\{[^}]+\}/g, '');

    return rendered;
  }

  private mapPrompt(record: any): any {
    return {
      id: record.id,
      organizationId: record.organization_id,
      name: record.name,
      description: record.description,
      content: record.content,
      currentVersion: record.current_version,
      tags: record.tags ?? [],
      category: record.category,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      createdBy: record.created_by
    };
  }
}
