import { ProviderFactory } from '../ai-provider/provider-factory.js';
import { createClient } from '@supabase/supabase-js';

export class CompetitorAnalysis {
  private ai = ProviderFactory.create('openrouter');

  private getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
  }

  async analyzeCompetitor(domain: string): Promise<any> {
    const prompt = `Perform a comprehensive SEO analysis of the website "${domain}".

Return JSON:
{
  "domain": "string",
  "estimatedOrganicTraffic": number,
  "estimatedTrafficValue": number,
  "topKeywords": [{"keyword": "string", "position": number, "traffic": number}],
  "seoScore": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "contentGaps": ["string"],
  "backlinkProfile": {
    "totalBacklinks": number,
    "referringDomains": number,
    "topDomains": [{"domain": "string", "links": number}]
  },
  "socialPresence": {
    "platforms": [{"name": "string", "url": "string", "estimatedFollowers": number}]
  },
  "techStack": ["string"],
  "opportunities": ["string"]
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { domain, seoScore: 50, strengths: [], weaknesses: [] };
    }
  }

  async trackCompetitor(orgId: string, competitor: { name: string; domain: string }): Promise<any> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('competitors')
      .upsert({
        organization_id: orgId,
        name: competitor.name,
        domain: competitor.domain,
        tracked_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to track competitor: ${error.message}`);
    return data;
  }

  async getCompetitorInsights(orgId: string, competitorId: string): Promise<any> {
    const supabase = this.getSupabase();
    const { data: competitor, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('id', competitorId)
      .eq('organization_id', orgId)
      .single();
    if (error || !competitor) throw new Error('Competitor not found');
    return this.analyzeCompetitor(competitor.domain);
  }

  async compareWithCompetitors(orgId: string, pageUrl: string): Promise<any> {
    const supabase = this.getSupabase();
    const { data: competitors } = await supabase
      .from('competitors')
      .select('*')
      .eq('organization_id', orgId);
    const domains = competitors?.map((c: any) => c.domain) ?? [];
    const prompt = `Compare the SEO performance of "${pageUrl}" against these competitors:
${domains.map((d: string) => `- ${d}`).join('\n')}

Return JSON:
{
  "pageUrl": "string",
  "competitors": [{"domain": "string", "seoScore": number, "strengthsVsYou": ["string"], "weaknessesVsYou": ["string"]}],
  "yourAdvantages": ["string"],
  "theirAdvantages": ["string"],
  "recommendations": ["string"],
  "marketPosition": "string (leader, challenger, niche player, etc.)"
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { pageUrl, competitors: [], recommendations: [] };
    }
  }

  async generateRecommendations(orgId: string, competitorId: string): Promise<string[]> {
    const supabase = this.getSupabase();
    const { data: competitor, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('id', competitorId)
      .eq('organization_id', orgId)
      .single();
    if (error || !competitor) throw new Error('Competitor not found');
    const analysis = await this.analyzeCompetitor(competitor.domain);
    return analysis.opportunities ?? analysis.recommendations ?? ['Monitor competitor activity regularly'];
  }
}
