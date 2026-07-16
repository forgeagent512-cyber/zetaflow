import { ProviderFactory } from '../ai-provider/provider-factory.js';

export class SocialMediaGenerator {
  private ai = ProviderFactory.create('openrouter');

  async generateLinkedInPost(topic: string, tone?: string): Promise<string> {
    const prompt = `Write a professional LinkedIn post about "${topic}"${tone ? ` with a ${tone} tone` : ''}.

Requirements:
- Professional yet engaging tone
- Hook in the first line
- 3-5 short paragraphs
- Include relevant hashtags (3-5)
- End with a question to drive engagement
- Max 1300 characters

Return only the post content:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 800 });
    return resp.content;
  }

  async generateTwitterPost(topic: string): Promise<string> {
    const prompt = `Write a Twitter/X post about "${topic}".

Requirements:
- Max 280 characters
- Hook in the first few words
- Include 1-2 relevant hashtags
- Can include a question or call to action
- Engaging and concise

Return only the post content:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 300 });
    return resp.content;
  }

  async generateFacebookPost(topic: string): Promise<string> {
    const prompt = `Write a Facebook post about "${topic}".

Requirements:
- Conversational, engaging tone
- 3-5 paragraphs
- Include a hook, story/context, and call to action
- Add 2-3 relevant hashtags
- Consider using emojis appropriately

Return only the post content:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 600 });
    return resp.content;
  }

  async generateInstagramPost(topic: string): Promise<{ caption: string; hashtags: string[] }> {
    const prompt = `Write an Instagram post caption about "${topic}".

Return JSON:
{
  "caption": "string (engaging caption with hook, body, and call to action, 300-500 chars)",
  "hashtags": ["string"] (10-15 relevant hashtags including niche tags)
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 800 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { caption: resp.content, hashtags: ['#' + topic.replace(/\s+/g, '')] };
    }
  }

  async generateThreadsPost(topic: string): Promise<string> {
    const prompt = `Write a Threads post about "${topic}".

Requirements:
- Casual, authentic tone
- 1-2 short paragraphs
- Max 500 characters
- Engaging hook
- Optional: include a question for replies

Return only the post content:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 400 });
    return resp.content;
  }

  async generateRedditPost(topic: string, subreddit?: string): Promise<string> {
    const prompt = `Write a Reddit post about "${topic}"${subreddit ? ` for r/${subreddit}` : ''}.

Requirements:
- Engaging title (max 300 chars)
- Body with context, story, or question
- Appropriate for Reddit community tone
- End with a discussion prompt

Format:
Title: [title]

[body]`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 800 });
    return resp.content;
  }

  async generateMediumArticle(topic: string): Promise<string> {
    const prompt = `Write a Medium article about "${topic}".

Requirements:
- Attention-grabbing title
- Subtitle (1 sentence)
- Introduction with hook
- 5-7 sections with subheadings
- Conclusion with key takeaways
- Include formatting markers for bold, quotes, and lists
- 800-1200 words

Return the full article in markdown format:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 3000 });
    return resp.content;
  }
}
