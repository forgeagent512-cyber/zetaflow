import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

const KEY_PREFIX = 'ba_';
const KEY_BYTES = 32;

export interface ApiKeyData {
  id: string;
  organizationId: string;
  userId?: string;
  name: string;
  scopes: string[];
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export class ApiKeyManager {
  async generateKey(orgId: string, userId: string, name: string, scopes: string[]): Promise<{ keyId: string; rawKey: string }> {
    const supabase = getSupabase();
    const keyId = crypto.randomUUID();
    const rawKey = `${KEY_PREFIX}${crypto.randomBytes(KEY_BYTES).toString('hex')}`;
    const keyHash = this.hashKey(rawKey);

    const { error } = await supabase.from('api_keys').insert({
      id: keyId,
      organization_id: orgId,
      user_id: userId,
      name,
      key_hash: keyHash,
      scopes,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { keyId, rawKey };
  }

  async validateKey(key: string): Promise<ApiKeyData | null> {
    const supabase = getSupabase();
    const keyHash = this.hashKey(key);
    const { data } = await supabase.from('api_keys').select('*').eq('key_hash', keyHash).single();
    if (!data) return null;
    if (!data.is_active) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);
    return this.mapRow(data);
  }

  async rotateKey(keyId: string): Promise<{ keyId: string; rawKey: string }> {
    const supabase = getSupabase();
    const { data: existing } = await supabase.from('api_keys').select('*').eq('id', keyId).single();
    if (!existing) throw new Error('API key not found');
    const rawKey = `${KEY_PREFIX}${crypto.randomBytes(KEY_BYTES).toString('hex')}`;
    const keyHash = this.hashKey(rawKey);
    const { error } = await supabase.from('api_keys').update({
      key_hash: keyHash,
      last_used_at: null,
      updated_at: new Date().toISOString(),
    }).eq('id', keyId);
    if (error) throw new Error(error.message);
    return { keyId, rawKey };
  }

  async revokeKey(keyId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('api_keys').update({
      is_active: false,
      updated_at: new Date().toISOString(),
    }).eq('id', keyId);
    if (error) throw new Error(error.message);
  }

  async getKeys(orgId: string): Promise<ApiKeyData[]> {
    const supabase = getSupabase();
    const { data } = await supabase.from('api_keys').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
    return (data ?? []).map(this.mapRow);
  }

  async getKeyUsage(keyId: string): Promise<Array<{ id: string; action: string; ipAddress?: string; createdAt: string }>> {
    const supabase = getSupabase();
    const { data } = await supabase.from('api_key_usage').select('*').eq('api_key_id', keyId).order('created_at', { ascending: false }).limit(100);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      action: r.action,
      ipAddress: r.ip_address,
      createdAt: r.created_at,
    }));
  }

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  private mapRow(row: any): ApiKeyData {
    return {
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      name: row.name,
      scopes: row.scopes ?? [],
      isActive: row.is_active,
      expiresAt: row.expires_at,
      lastUsedAt: row.last_used_at,
      createdAt: row.created_at,
    };
  }
}
