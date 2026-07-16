import { createClient } from '@supabase/supabase-js';
import type { FeatureFlag } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export class FeatureFlagManager {
  async getFlags(orgId?: string): Promise<FeatureFlag[]> {
    const supabase = getSupabase();
    let query = supabase.from('feature_flags').select('*').order('name', { ascending: true });
    const { data } = await query;
    const flags = (data ?? []).map(this.mapRow);
    if (orgId) {
      return flags.filter(f => !f.organizations || f.organizations.length === 0 || f.organizations.includes(orgId));
    }
    return flags;
  }

  async getFlag(key: string, orgId?: string): Promise<FeatureFlag | null> {
    const supabase = getSupabase();
    const { data } = await supabase.from('feature_flags').select('*').eq('key', key).single();
    if (!data) return null;
    const flag = this.mapRow(data);
    if (orgId && flag.organizations && flag.organizations.length > 0 && !flag.organizations.includes(orgId)) {
      return { ...flag, isEnabled: false };
    }
    return flag;
  }

  async isEnabled(key: string, orgId?: string): Promise<boolean> {
    const flag = await this.getFlag(key, orgId);
    return flag?.isEnabled ?? false;
  }

  async createFlag(flag: Omit<FeatureFlag, 'id'>): Promise<FeatureFlag> {
    const supabase = getSupabase();
    const id = crypto.randomUUID();
    const { data, error } = await supabase.from('feature_flags').insert({
      id,
      name: flag.name,
      key: flag.key,
      description: flag.description,
      is_enabled: flag.isEnabled,
      is_beta: flag.isBeta ?? false,
      organizations: flag.organizations ?? [],
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async updateFlag(key: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const supabase = getSupabase();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isEnabled !== undefined) payload.is_enabled = data.isEnabled;
    if (data.isBeta !== undefined) payload.is_beta = data.isBeta;
    if (data.organizations !== undefined) payload.organizations = data.organizations;
    const { data: result, error } = await supabase.from('feature_flags').update(payload).eq('key', key).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(result);
  }

  async enableForOrg(key: string, orgId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: flag } = await supabase.from('feature_flags').select('*').eq('key', key).single();
    if (!flag) throw new Error('Feature flag not found');
    const orgs: string[] = flag.organizations ?? [];
    if (!orgs.includes(orgId)) {
      orgs.push(orgId);
    }
    const { error } = await supabase.from('feature_flags').update({
      organizations: orgs,
      is_enabled: true,
      updated_at: new Date().toISOString(),
    }).eq('key', key);
    if (error) throw new Error(error.message);
  }

  async disableForOrg(key: string, orgId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: flag } = await supabase.from('feature_flags').select('*').eq('key', key).single();
    if (!flag) throw new Error('Feature flag not found');
    const orgs: string[] = (flag.organizations ?? []).filter((o: string) => o !== orgId);
    const { error } = await supabase.from('feature_flags').update({
      organizations: orgs,
      is_enabled: orgs.length === 0 ? false : true,
      updated_at: new Date().toISOString(),
    }).eq('key', key);
    if (error) throw new Error(error.message);
  }

  private mapRow(row: any): FeatureFlag {
    return {
      id: row.id,
      name: row.name,
      key: row.key,
      description: row.description,
      isEnabled: row.is_enabled,
      isBeta: row.is_beta,
      organizations: row.organizations,
    };
  }
}
