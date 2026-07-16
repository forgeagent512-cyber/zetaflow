import type { LandingPage, BlogPost } from './seo.types.js';
import { ProviderFactory } from '../ai-provider/provider-factory.js';

export class ContentStudio {
  private ai = ProviderFactory.create('openrouter');

  async generateLandingPage(data: { industry: string; audience: string; goal: string }): Promise<LandingPage> {
    const prompt = `Generate a complete landing page for:
Industry: ${data.industry}
Target Audience: ${data.audience}
Goal: ${data.goal}

Return JSON with:
{
  "title": "string (compelling headline)",
  "slug": "string (url-friendly)",
  "heroSection": {"headline": "string", "subheadline": "string", "ctaText": "string"},
  "featuresSection": {"features": [{"title": "string", "description": "string", "icon": "string"}]},
  "ctaSection": {"headline": "string", "description": "string", "buttonText": "string"},
  "pricingSection": {"plans": [{"name": "string", "price": "string", "features": ["string"]}]},
  "testimonialsSection": {"testimonials": [{"name": "string", "role": "string", "content": "string"}]},
  "faqsSection": {"faqs": [{"question": "string", "answer": "string"}]},
  "seoMetadata": {"metaTitle": "string", "metaDescription": "string", "keywords": ["string"]}
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 3000 });
    try {
      const parsed = JSON.parse(resp.content);
      return {
        industry: data.industry,
        targetAudience: data.audience,
        goal: data.goal,
        status: 'draft',
        ...parsed,
      };
    } catch {
      return {
        industry: data.industry,
        targetAudience: data.audience,
        goal: data.goal,
        title: data.industry,
        slug: data.industry.toLowerCase().replace(/\s+/g, '-'),
        status: 'draft',
        organizationId: '',
      };
    }
  }

  async generateBlogPost(topic: string, keywords: string[]): Promise<BlogPost> {
    const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}".
Target keywords: ${keywords.join(', ')}

Return JSON:
{
  "title": "string (SEO-optimized, compelling)",
  "slug": "string (url-friendly)",
  "excerpt": "string (150-160 chars meta description)",
  "content": "string (full article with markdown formatting, H2/H3 structure, 1000-2000 words)",
  "tags": ["string"],
  "metaTitle": "string (50-60 chars)",
  "metaDescription": "string (150-160 chars)"
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 4000 });
    try {
      const parsed = JSON.parse(resp.content);
      return {
        topic,
        tags: keywords,
        status: 'draft',
        seoScore: 0,
        ...parsed,
      };
    } catch {
      return {
        title: topic,
        slug: topic.toLowerCase().replace(/\s+/g, '-'),
        content: resp.content,
        tags: keywords,
        status: 'draft',
        organizationId: '',
      };
    }
  }

  async generateArticle(topic: string, outline: string[]): Promise<any> {
    const prompt = `Write a detailed article about "${topic}" following this outline:
${outline.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Return JSON:
{
  "title": "string",
  "slug": "string",
  "metaDescription": "string",
  "introduction": "string",
  "sections": [{"heading": "string", "content": "string", "keyPoints": ["string"]}],
  "conclusion": "string",
  "tags": ["string"],
  "estimatedReadTime": "number (minutes)"
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 4000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { title: topic, slug: topic.toLowerCase().replace(/\s+/g, '-'), content: resp.content };
    }
  }

  async generateCaseStudy(data: any): Promise<any> {
    const prompt = `Generate a compelling case study based on the following data:
${JSON.stringify(data, null, 2)}

Return JSON:
{
  "title": "string",
  "subtitle": "string",
  "clientName": "string",
  "clientIndustry": "string",
  "challenge": "string",
  "solution": "string",
  "results": [{"metric": "string", "value": "string", "description": "string"}],
  "testimonial": {"name": "string", "role": "string", "quote": "string"},
  "conclusion": "string",
  "tags": ["string"]
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { title: 'Case Study', content: resp.content };
    }
  }

  async generateEmailCampaign(data: any): Promise<any> {
    const prompt = `Generate an email marketing campaign based on:
${JSON.stringify(data, null, 2)}

Return JSON:
{
  "subjectLine": "string",
  "preheaderText": "string",
  "emailBody": "string (HTML-compatible with sections)",
  "ctaButton": {"text": "string", "url": "string"},
  "subjectLineVariants": ["string"],
  "personalizationTips": ["string"]
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { subjectLine: 'Campaign', emailBody: resp.content };
    }
  }

  async generateSalesPage(product: any): Promise<any> {
    const prompt = `Generate a high-converting sales page for this product:
${JSON.stringify(product, null, 2)}

Return JSON:
{
  "headline": "string",
  "subheadline": "string",
  "heroSection": {"headline": "string", "subheadline": "string", "ctaText": "string"},
  "problemSection": "string",
  "solutionSection": "string",
  "featuresSection": [{"feature": "string", "benefit": "string", "description": "string"}],
  "socialProofSection": {"testimonials": [{"name": "string", "quote": "string"}], "stats": [{"value": "string", "label": "string"}]},
  "pricingSection": {"plans": [{"name": "string", "price": "string", "features": ["string"], "cta": "string"}]},
  "faqSection": [{"question": "string", "answer": "string"}],
  "finalCta": {"headline": "string", "buttonText": "string", "urgencyText": "string"}
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 3000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { headline: product.name, content: resp.content };
    }
  }

  async generateProductDescription(product: any): Promise<string> {
    const prompt = `Write a compelling, SEO-optimized product description for:
${JSON.stringify(product, null, 2)}

Include:
- Engaging opening paragraph
- Key features and benefits
- Technical specifications
- Use cases
- Call to action

Return only the description text (no JSON):`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 1000 });
    return resp.content;
  }

  async generateKnowledgeBase(topic: string): Promise<any> {
    const prompt = `Generate a comprehensive knowledge base article about "${topic}".

Return JSON:
{
  "title": "string",
  "slug": "string",
  "category": "string",
  "difficulty": "beginner | intermediate | advanced",
  "sections": [{"heading": "string", "content": "string", "codeExample": "string (optional)"}],
  "relatedArticles": [{"title": "string", "slug": "string"}],
  "searchTags": ["string"]
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 3000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { title: topic, slug: topic.toLowerCase().replace(/\s+/g, '-'), content: resp.content };
    }
  }

  async generateWhitepaper(topic: string): Promise<any> {
    const prompt = `Generate a professional whitepaper about "${topic}".

Return JSON:
{
  "title": "string",
  "subtitle": "string",
  "executiveSummary": "string",
  "introduction": "string",
  "sections": [{"heading": "string", "content": "string", "keyInsights": ["string"]}],
  "dataPoints": [{"stat": "string", "source": "string", "context": "string"}],
  "conclusion": "string",
  "recommendations": ["string"],
  "references": [{"title": "string", "url": "string"}],
  "authorInfo": {"name": "string", "credentials": "string"}
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 4000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { title: topic, content: resp.content };
    }
  }

  async generatePressRelease(data: any): Promise<any> {
    const prompt = `Generate a professional press release based on:
${JSON.stringify(data, null, 2)}

Return JSON:
{
  "headline": "string",
  "subheadline": "string",
  "dateline": "string (city, state - date)",
  "body": "string",
  "boilerplate": "string (company description)",
  "mediaContact": {"name": "string", "title": "string", "email": "string", "phone": "string"},
  "aboutSection": "string",
  "tags": ["string"]
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { headline: data.title ?? 'Press Release', body: resp.content };
    }
  }
}
