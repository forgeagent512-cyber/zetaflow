import { createClient } from '@supabase/supabase-js';
import type { WhiteLabelSettings } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export class WhiteLabelEngine {
  async getSettings(orgId: string): Promise<WhiteLabelSettings | null> {
    const supabase = getSupabase();
    const { data } = await supabase.from('white_label_settings').select('*').eq('organization_id', orgId).single();
    return data;
  }

  async updateSettings(orgId: string, settings: Partial<WhiteLabelSettings>): Promise<WhiteLabelSettings> {
    const supabase = getSupabase();
    const { data: existing } = await supabase.from('white_label_settings').select('id').eq('organization_id', orgId).single();
    if (existing) {
      const { data, error } = await supabase.from('white_label_settings').update(settings).eq('organization_id', orgId).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase.from('white_label_settings').insert({ organization_id: orgId, ...settings }).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async applyBranding(orgId: string, htmlContent: string): Promise<string> {
    const settings = await this.getSettings(orgId);
    if (!settings) return htmlContent;
    let result = htmlContent;
    if (settings.logoUrl) result = result.replace(/{{LOGO_URL}}/g, settings.logoUrl);
    if (settings.primaryColor) result = result.replace(/{{PRIMARY_COLOR}}/g, settings.primaryColor);
    if (settings.faviconUrl) result = result.replace(/{{FAVICON_URL}}/g, settings.faviconUrl);
    if (settings.customCss) result = result.replace('</head>', `<style>${settings.customCss}</style></head>`);
    if (settings.customJs) result = result.replace('</body>', `<script>${settings.customJs}</script></body>`);
    if (settings.footerText) result = result.replace(/{{FOOTER_TEXT}}/g, settings.footerText);
    return result;
  }

  async validateCustomDomain(domain: string): Promise<{ valid: boolean; dnsRecords: Array<{ type: string; name: string; value: string }> }> {
    try {
      const resp = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await resp.json() as any;
      const hasRecords = Array.isArray(data.Answer) && data.Answer.length > 0;
      return {
        valid: hasRecords,
        dnsRecords: [
          { type: 'A', name: domain, value: process.env.PLATFORM_IP ?? '76.76.21.21' },
          { type: 'CNAME', name: `www.${domain}`, value: process.env.PLATFORM_DOMAIN ?? 'buildagent.ai' },
        ],
      };
    } catch {
      return { valid: false, dnsRecords: [{ type: 'A', name: domain, value: process.env.PLATFORM_IP ?? '76.76.21.21' }] };
    }
  }

  async verifyCustomDomain(orgId: string): Promise<boolean> {
    const settings = await this.getSettings(orgId);
    if (!settings?.customDomain) return false;
    const result = await this.validateCustomDomain(settings.customDomain);
    if (result.valid) {
      const supabase = getSupabase();
      await supabase.from('white_label_settings').update({ custom_domain_verified: true }).eq('organization_id', orgId);
      return true;
    }
    return false;
  }
}
