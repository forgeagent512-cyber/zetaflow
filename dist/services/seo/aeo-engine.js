import { ProviderFactory } from '../ai-provider/provider-factory.js';
export class AEOEngine {
    ai = ProviderFactory.create('openrouter');
    async generateFAQs(orgId, topic) {
        const prompt = `Generate 5-7 frequently asked questions and detailed answers about "${topic}" for Answer Engine Optimization.
Each answer should be concise, factual, and structured for featured snippets.

Return JSON array:
[{"question": "string", "answer": "string", "keywords": ["string"], "schemaMarkupType": "FAQPage"}]`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 2000 });
        try {
            const items = JSON.parse(resp.content);
            return items.map((item) => ({
                organizationId: orgId,
                contentType: 'faq',
                question: item.question,
                answer: item.answer,
                keywords: item.keywords ?? [],
                schemaMarkup: { '@type': item.schemaMarkupType ?? 'FAQPage' },
                relatedEntities: [],
            }));
        }
        catch {
            return [{
                    organizationId: orgId,
                    contentType: 'faq',
                    question: `What is ${topic}?`,
                    answer: resp.content,
                    schemaMarkup: { '@type': 'FAQPage' },
                }];
        }
    }
    async generateAnswerBlock(question) {
        const prompt = `Provide a concise, authoritative answer to the following question, optimized for featured snippets and answer engines.

Question: "${question}"

Format the answer as a clear, direct response that could appear as a featured snippet.
Include schema markup type and relevant keywords.

Return JSON:
{
  "answer": "string (concise, 40-60 words)",
  "detailedAnswer": "string (detailed, up to 200 words)",
  "keywords": ["string"],
  "schemaType": "string (e.g., QAPage, Article)"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 1000 });
        try {
            const parsed = JSON.parse(resp.content);
            return {
                organizationId: '',
                contentType: 'answer',
                question,
                answer: parsed.detailedAnswer ?? parsed.answer,
                keywords: parsed.keywords,
                schemaMarkup: { '@type': parsed.schemaType ?? 'QAPage' },
            };
        }
        catch {
            return { organizationId: '', contentType: 'answer', question, answer: resp.content };
        }
    }
    async generateHowToContent(topic, steps) {
        const prompt = `Create comprehensive how-to content for "${topic}" optimized for answer engines.

Steps provided:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Expand each step with detailed instructions, tips, and expected outcomes.
Include schema markup for HowTo.

Return JSON:
{
  "question": "How to ${topic}",
  "answer": "string (step-by-step guide)",
  "keywords": ["string"],
  "steps": [{"name": "string", "text": "string", "tip": "string"}],
  "estimatedTime": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 2000 });
        try {
            const parsed = JSON.parse(resp.content);
            return {
                organizationId: '',
                contentType: 'how-to',
                question: parsed.question,
                answer: parsed.answer,
                keywords: parsed.keywords,
                schemaMarkup: {
                    '@type': 'HowTo',
                    step: parsed.steps?.map((s, i) => ({
                        '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text,
                    })),
                },
            };
        }
        catch {
            return { organizationId: '', contentType: 'how-to', question: `How to ${topic}`, answer: resp.content };
        }
    }
    async generateComparisonPage(items) {
        const prompt = `Create a comparison page optimized for answer engines comparing these items:
${items.map(i => `- ${i.name}: ${i.features.join(', ')}`).join('\n')}

Return JSON:
{
  "question": "string (e.g., X vs Y vs Z comparison)",
  "answer": "string (detailed comparison)",
  "keywords": ["string"],
  "comparisonTable": [{"feature": "string", "items": {}}],
  "verdict": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 2000 });
        try {
            const parsed = JSON.parse(resp.content);
            return {
                organizationId: '',
                contentType: 'comparison',
                question: parsed.question,
                answer: parsed.answer,
                keywords: parsed.keywords,
                schemaMarkup: { '@type': 'Article', about: items.map(i => i.name) },
            };
        }
        catch {
            return { organizationId: '', contentType: 'comparison', question: 'Comparison', answer: resp.content };
        }
    }
    async generateGlossary(terms) {
        const entries = [];
        for (const { term, definition } of terms) {
            const prompt = `Optimize this glossary entry for answer engines:
Term: "${term}"
Definition: "${definition}"

Expand the definition to 2-3 sentences with context. Include related concepts.

Return JSON:
{"answer": "string", "keywords": ["string"], "relatedTerms": ["string"]}`;
            try {
                const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 500 });
                const parsed = JSON.parse(resp.content);
                entries.push({
                    organizationId: '',
                    contentType: 'glossary',
                    question: `What is ${term}?`,
                    answer: parsed.answer,
                    keywords: parsed.keywords,
                    relatedEntities: parsed.relatedTerms,
                });
            }
            catch {
                entries.push({
                    organizationId: '',
                    contentType: 'glossary',
                    question: `What is ${term}?`,
                    answer: definition,
                });
            }
        }
        return entries;
    }
    async optimizeForFeaturedSnippets(content) {
        const prompt = `Rewrite the following content to be optimized for Google Featured Snippets and answer engines.

Requirements:
- Start with a direct answer to the implied question (40-60 words)
- Use bullet points or numbered lists where appropriate
- Use clear, factual language
- Include the target keyword in the first paragraph
- Keep paragraphs short (1-3 sentences)
- Use header tags to structure content

Original content:
${content}

Return only the optimized content:`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 1500 });
        return resp.content;
    }
}
