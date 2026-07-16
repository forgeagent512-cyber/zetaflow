import { ProviderFactory } from '../ai-provider/provider-factory.js';
import { createClient } from '@supabase/supabase-js';

export class LocalizationService {
  private ai = ProviderFactory.create('openrouter');

  private getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
  }

  async translateContent(content: string, targetLocale: string): Promise<string> {
    const prompt = `Translate the following content to ${targetLocale}.
Preserve all HTML/markdown formatting. Keep SEO keywords when possible.
Maintain the original tone and style.

Content:
${content}

Return only the translated content:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.1, maxTokens: 2048 });
    return resp.content;
  }

  async generateLocalizedSEO(orgId: string, locale: string, source: any): Promise<any> {
    const prompt = `Generate localized SEO metadata for locale "${locale}" based on the following source data:

${JSON.stringify(source, null, 2)}

Return JSON:
{
  "metaTitle": "string (localized, 50-60 chars)",
  "metaDescription": "string (localized, 150-160 chars)",
  "keywords": ["string (localized keywords)"],
  "h1Tag": "string (localized)",
  "slug": "string (localized URL slug)",
  "ogTitle": "string (localized OG title)",
  "ogDescription": "string (localized OG description)",
  "localeSpecificNotes": "string"
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 1000 });
    try {
      const parsed = JSON.parse(resp.content);
      return { organizationId: orgId, locale, ...parsed };
    } catch {
      return { organizationId: orgId, locale, metaTitle: source.title ?? '' };
    }
  }

  async generateLocalizedSchema(schema: any, locale: string): Promise<any> {
    const localized = { ...schema };
    if (localized.name && typeof localized.name === 'string') {
      localized.name = await this.translateContent(localized.name, locale);
    }
    if (localized.description && typeof localized.description === 'string') {
      localized.description = await this.translateContent(localized.description, locale);
    }
    if (localized.alternateName) {
      localized.alternateName = await this.translateContent(localized.alternateName, locale);
    }
    if (localized.step && Array.isArray(localized.step)) {
      for (const step of localized.step) {
        if (step.name) step.name = await this.translateContent(step.name, locale);
        if (step.text) step.text = await this.translateContent(step.text, locale);
      }
    }
    return localized;
  }

  async generateLocalizedURLs(orgId: string, baseUrl: string, locales: string[]): Promise<any[]> {
    const urls: any[] = [];
    for (const locale of locales) {
      const prompt = `Generate a localized URL structure for locale "${locale}" based on base URL "${baseUrl}".

Return JSON:
{
  "locale": "string",
  "basePath": "string (e.g., /fr/ or /fr-ca/)",
  "urlStructure": "string (e.g., /{locale}/{slug})",
  "hreflangTag": "string (e.g., fr-ca)",
  "exampleUrls": {
    "homepage": "string",
    "about": "string",
    "contact": "string",
    "blog": "string"
  },
  "notes": "string (any special considerations for this locale)"
}`;
      try {
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 500 });
        urls.push(JSON.parse(resp.content));
      } catch {
        urls.push({ locale, basePath: `/${locale}/` });
      }
    }
    return urls;
  }
}
