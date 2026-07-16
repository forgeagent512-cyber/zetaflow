import type { SEOAnalysis } from './seo.types.js';
import { ProviderFactory } from '../ai-provider/provider-factory.js';

export class SEOAnalyzer {
  private ai = ProviderFactory.create('openrouter');

  async analyzePage(url: string, content: string): Promise<SEOAnalysis> {
    const [titleAnalysis, descriptionAnalysis, keywordAnalysis, headingAnalysis, imageAnalysis, linkAnalysis, perfAnalysis] = await Promise.all([
      this.analyzeTitle(content),
      this.analyzeDescription(content),
      this.analyzeKeywords(content),
      this.analyzeHeadings(content),
      this.analyzeImages(content),
      this.analyzeLinks(content),
      this.analyzePerformance(content),
    ]);

    const score = Math.round(
      (titleAnalysis.score +
        descriptionAnalysis.score +
        keywordAnalysis.score +
        headingAnalysis.score +
        imageAnalysis.score +
        linkAnalysis.score +
        perfAnalysis.score) / 7
    );

    const recommendations = this.generateRecommendations({
      score,
      title: titleAnalysis,
      description: descriptionAnalysis,
      keywords: keywordAnalysis,
      headings: headingAnalysis,
      images: imageAnalysis,
      links: linkAnalysis,
      performance: perfAnalysis,
      recommendations: [],
    });

    return {
      score,
      title: titleAnalysis,
      description: descriptionAnalysis,
      keywords: keywordAnalysis,
      headings: headingAnalysis,
      images: imageAnalysis,
      links: linkAnalysis,
      performance: perfAnalysis,
      recommendations,
    };
  }

  generateMetaTags(title: string, description: string, keywords: string[]): SEOAnalysis['title'] {
    const issues: string[] = [];
    if (title.length < 30 || title.length > 60) {
      issues.push(`Title length ${title.length} is ${title.length < 30 ? 'too short' : 'too long'} (ideal: 30-60 chars)`);
    }
    if (description.length < 120 || description.length > 160) {
      issues.push(`Description length ${description.length} is ${description.length < 120 ? 'too short' : 'too long'} (ideal: 120-160 chars)`);
    }
    const score = Math.max(0, 100 - issues.length * 25);
    return { content: title, length: title.length, score, issues };
  }

  checkReadability(content: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).filter(Boolean).length, 0) / sentences.length;
    if (avgSentenceLength > 25) issues.push(`Average sentence length ${Math.round(avgSentenceLength)} is too high, aim for under 20 words`);
    const words = content.split(/\s+/).filter(Boolean);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    if (avgWordLength > 6) issues.push(`Average word length ${avgWordLength.toFixed(1)} is high, use simpler vocabulary`);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.some(p => p.split(/\s+/).filter(Boolean).length > 300)) issues.push('Some paragraphs exceed 300 words, break them up');
    const score = Math.max(0, 100 - issues.length * 33);
    return { score, issues };
  }

  generateRecommendations(analysis: SEOAnalysis): string[] {
    const recs: string[] = [];
    if (analysis.title.score < 70) {
      analysis.title.issues.forEach(i => recs.push(`Title issue: ${i}`));
      recs.push('Optimize the title tag to include primary keyword near the beginning');
    }
    if (analysis.description.score < 70) {
      analysis.description.issues.forEach(i => recs.push(`Meta description issue: ${i}`));
      recs.push('Write a compelling meta description that includes target keywords and a call to action');
    }
    if (analysis.keywords.score < 70) {
      analysis.keywords.issues.forEach(i => recs.push(`Keyword issue: ${i}`));
      recs.push('Improve keyword usage: maintain 1-2% keyword density and use LSI keywords');
    }
    if (analysis.headings.score < 70) {
      analysis.headings.issues.forEach(i => recs.push(`Heading issue: ${i}`));
      recs.push('Restructure headings to follow a clear hierarchy (H1 > H2 > H3) with keyword-rich headings');
    }
    if (analysis.images.score < 70) {
      analysis.images.issues.forEach(i => recs.push(`Image issue: ${i}`));
      recs.push('Add descriptive alt text to all images and use descriptive filenames');
    }
    if (analysis.links.score < 70) {
      analysis.links.issues.forEach(i => recs.push(`Link issue: ${i}`));
      recs.push('Add more internal links and fix any broken links found on the page');
    }
    if (analysis.performance.score < 70) {
      analysis.performance.issues.forEach(i => recs.push(`Performance issue: ${i}`));
    }
    return recs;
  }

  private async analyzeTitle(content: string): Promise<SEOAnalysis['title']> {
    const prompt = `Analyze the following content and provide a title analysis as JSON:
- Extract the most likely page title
- Evaluate length (ideal 30-60 chars)
- Score 0-100
- List any issues

Content: ${content.slice(0, 500)}

Respond with JSON: { "content": "title text", "length": 0, "score": 0, "issues": [] }`;
    try {
      const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.1 });
      return JSON.parse(resp.content);
    } catch {
      return { content: '', length: 0, score: 50, issues: ['Could not analyze title'] };
    }
  }

  private async analyzeDescription(content: string): Promise<SEOAnalysis['description']> {
    const prompt = `Analyze the following content for meta description quality. Return JSON:
{ "content": "suggested description", "length": 0, "score": 0, "issues": [] }

Content: ${content.slice(0, 500)}`;
    try {
      const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.1 });
      return JSON.parse(resp.content);
    } catch {
      return { content: '', length: 0, score: 50, issues: ['Could not analyze description'] };
    }
  }

  private async analyzeKeywords(content: string): Promise<SEOAnalysis['keywords']> {
    const prompt = `Analyze keywords in this content. Extract keywords and evaluate. Return JSON:
{ "keywords": [], "density": 0.0, "score": 0, "issues": [] }

Content: ${content.slice(0, 1000)}`;
    try {
      const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.1 });
      return JSON.parse(resp.content);
    } catch {
      return { keywords: [], density: 0, score: 50, issues: ['Could not analyze keywords'] };
    }
  }

  private async analyzeHeadings(content: string): Promise<SEOAnalysis['headings']> {
    const h1 = content.match(/<h1[^>]*>.*?<\/h1>/gi) ?? [];
    const h2 = content.match(/<h2[^>]*>.*?<\/h2>/gi) ?? [];
    const h3 = content.match(/<h3[^>]*>.*?<\/h3>/gi) ?? [];
    const structure = [...h1, ...h2, ...h3].map(h => h.replace(/<[^>]+>/g, ''));
    const markdownHeadings = content.match(/^#{1,3}\s.+$/gm) ?? [];
    const allHeadings = [...structure, ...markdownHeadings];
    const issues: string[] = [];
    if (allHeadings.length === 0) issues.push('No heading tags found');
    if (h1.length === 0 && !markdownHeadings.some(h => h.startsWith('# '))) issues.push('No H1 tag found');
    if (h1.length > 1) issues.push('Multiple H1 tags found');
    const score = Math.max(0, 100 - issues.length * 33);
    return { structure: allHeadings, score, issues };
  }

  private async analyzeImages(content: string): Promise<SEOAnalysis['images']> {
    const imgTags = content.match(/<img[^>]+>/gi) ?? [];
    const markdownImages = content.match(/!\[.*?\]\(.*?\)/g) ?? [];
    const count = imgTags.length + markdownImages.length;
    const withAlt = imgTags.filter(i => /alt\s*=\s*["']/.test(i)).length + markdownImages.filter(i => /\[.*?\]/.test(i)).length;
    const issues: string[] = [];
    if (count === 0) issues.push('No images found on the page');
    if (count > 0 && withAlt < count) issues.push(`${count - withAlt} images missing alt text`);
    const score = count === 0 ? 50 : Math.max(0, 100 - (count - withAlt) * 20);
    return { count, withAlt, score, issues };
  }

  private async analyzeLinks(content: string): Promise<SEOAnalysis['links']> {
    const allLinks = content.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi) ?? [];
    const markdownLinks = content.match(/\[.*?\]\((.*?)\)/g) ?? [];
    const internal = allLinks.filter(l => /href=["'](?:\/|[^http])/.test(l)).length + markdownLinks.filter(l => /\]\(\//.test(l)).length;
    const external = allLinks.filter(l => /href=["']https?:\/\//.test(l)).length + markdownLinks.filter(l => /\]\(https?:\/\//.test(l)).length;
    const issues: string[] = [];
    if (internal === 0 && external === 0) issues.push('No links found on the page');
    if (internal === 0 && external > 0) issues.push('No internal links found');
    const score = internal + external === 0 ? 50 : Math.max(0, 100 - (internal === 0 ? 30 : 0));
    return { internal, external, broken: 0, score, issues };
  }

  private async analyzePerformance(content: string): Promise<SEOAnalysis['performance']> {
    const issues: string[] = [];
    const scriptCount = (content.match(/<script/gi) ?? []).length;
    if (scriptCount > 10) issues.push(`Page has ${scriptCount} scripts, consider reducing`);
    const imageCount = (content.match(/<img/gi) ?? []).length;
    if (imageCount > 10) issues.push(`Page has ${imageCount} images, consider lazy loading`);
    const cssCount = (content.match(/<link[^>]*rel=["']stylesheet["']/gi) ?? []).length;
    if (cssCount > 3) issues.push(`Page has ${cssCount} CSS files, consider combining`);
    const score = Math.max(0, 100 - issues.length * 33);
    return { score, issues };
  }
}
