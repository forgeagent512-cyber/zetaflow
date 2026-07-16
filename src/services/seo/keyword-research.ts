import type { Keyword } from './seo.types.js';
import { ProviderFactory } from '../ai-provider/provider-factory.js';

export class KeywordResearch {
  private ai = ProviderFactory.create('openrouter');

  async discoverKeywords(seed: string): Promise<Keyword[]> {
    const prompt = `Research and generate a comprehensive list of SEO keywords related to "${seed}".

For each keyword, provide:
- Search intent (informational, commercial, transactional, navigational)
- Estimated difficulty (0-100)
- Opportunity score (0-100)
- Competition level (low, medium, high)

Return a JSON array of 15-20 keywords:
[{"keyword": "string", "searchVolume": number (estimate 0-100000), "difficulty": number (0-100), "opportunityScore": number (0-100), "intent": "informational|commercial|transactional|navigational", "competition": number (0-100)}]`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return [{ keyword: seed, searchVolume: 0, difficulty: 50, opportunityScore: 50 }];
    }
  }

  async getLongTailVariations(keyword: string): Promise<string[]> {
    const prompt = `Generate 15-20 long-tail keyword variations for "${keyword}".
Long-tail keywords should be 3-5 word phrases with lower competition and higher conversion intent.

Return as a JSON array of strings only:
["keyword variation 1", "keyword variation 2", ...]`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 1000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return [keyword];
    }
  }

  async analyzeCompetition(keyword: string): Promise<{ difficulty: number; competitors: string[]; opportunity: number }> {
    const prompt = `Analyze the competitive landscape for the keyword "${keyword}" in SEO.

Return JSON:
{
  "difficulty": number (0-100, where 100 is hardest),
  "competitors": ["domain1.com", "domain2.com", ...] (top 5-7 competing domains),
  "opportunity": number (0-100, where 100 is highest opportunity)
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 1000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { difficulty: 50, competitors: [], opportunity: 50 };
    }
  }

  async getQuestions(keyword: string): Promise<string[]> {
    const prompt = `Generate 15-20 "People Also Ask" style questions related to "${keyword}".
These should be natural language questions that users search for.

Return as a JSON array of strings:
["Question 1?", "Question 2?", ...]`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 1000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return [`What is ${keyword}?`];
    }
  }

  async analyzeSearchIntent(keyword: string): Promise<string> {
    const prompt = `Analyze the search intent for the keyword "${keyword}".

Return JSON:
{
  "primaryIntent": "informational | commercial | transactional | navigational",
  "confidence": number (0-100),
  "reasoning": "string (detailed explanation)",
  "suggestedContentTypes": ["blog post", "landing page", "product page", "guide", "video"],
  "targetAudience": "string"
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 500 });
    try {
      const parsed = JSON.parse(resp.content);
      return parsed.primaryIntent ?? resp.content;
    } catch {
      return 'informational';
    }
  }

  async getKeywordSuggestions(seed: string): Promise<Keyword[]> {
    const prompt = `Generate keyword cluster suggestions for "${seed}" with semantic relevance.

Return JSON array:
[{"keyword": "string", "searchVolume": number, "difficulty": number (0-100), "opportunityScore": number (0-100), "intent": "string", "competition": number (0-100), "relatedKeywords": ["string"], "questions": ["string"]}]`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return [{ keyword: seed, relatedKeywords: [], questions: [] }];
    }
  }
}
