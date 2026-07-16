import { ProviderFactory } from '../ai-provider/provider-factory.js';
export class VideoScriptGenerator {
    ai = ProviderFactory.create('openrouter');
    async generateYouTubeScript(topic, duration) {
        const targetDuration = duration ?? 8;
        const prompt = `Write a YouTube video script about "${topic}" (target duration: ${targetDuration} minutes).

Return JSON:
{
  "title": "string (SEO-optimized, clickable title)",
  "description": "string (SEO description with timestamps and links)",
  "tags": ["string (relevant SEO tags)"],
  "thumbnailIdeas": ["string (3-4 thumbnail concept ideas)"],
  "script": [
    {"timestamp": "0:00", "section": "Hook", "content": "string", "visualCue": "string"},
    {"timestamp": "string", "section": "Introduction", "content": "string", "visualCue": "string"},
    {"timestamp": "string", "section": "Main Content", "content": "string", "visualCue": "string"},
    {"timestamp": "string", "section": "Conclusion", "content": "string", "visualCue": "string"},
    {"timestamp": "string", "section": "Call to Action", "content": "string", "visualCue": "string"}
  ],
  "estimatedDuration": "string",
  "keyTakeaways": ["string"]
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 3000 });
        try {
            return JSON.parse(resp.content);
        }
        catch {
            return { title: topic, script: [{ section: 'Content', content: resp.content }] };
        }
    }
    async generateTikTokScript(topic) {
        const prompt = `Write a TikTok video script about "${topic}" (15-60 seconds).

Return JSON:
{
  "caption": "string (engaging caption with hashtags)",
  "hashtags": ["string (5-7 trending hashtags)"],
  "script": [
    {"time": "0-3s", "visual": "string", "audio": "string", "text": "string"},
    {"time": "3-10s", "visual": "string", "audio": "string", "text": "string"},
    {"time": "10-15s", "visual": "string", "audio": "string", "text": "string"}
  ],
  "hookStrategy": "string",
  "callToAction": "string",
  "trendingAudioSuggestion": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 1000 });
        try {
            return JSON.parse(resp.content);
        }
        catch {
            return { caption: topic, script: [{ visual: topic }] };
        }
    }
    async generateReelScript(topic) {
        const prompt = `Write an Instagram Reel script about "${topic}" (30-90 seconds).

Return JSON:
{
  "caption": "string (with hashtags)",
  "hashtags": ["string (8-10 hashtags)"],
  "script": [
    {"time": "0-5s", "visual": "string", "textOverlay": "string", "audio": "string"},
    {"time": "string", "visual": "string", "textOverlay": "string", "audio": "string"},
    {"time": "string", "visual": "string", "textOverlay": "string", "audio": "string"}
  ],
  "hook": "string",
  "cta": "string",
  "trendingAudio": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 1000 });
        try {
            return JSON.parse(resp.content);
        }
        catch {
            return { caption: topic, script: [] };
        }
    }
    async generateShortsScript(topic) {
        const prompt = `Write a YouTube Shorts script about "${topic}" (max 60 seconds).

Return JSON:
{
  "title": "string (clickable shorts title)",
  "description": "string (#shorts hashtags and description)",
  "script": [
    {"time": "0-3s", "visual": "string", "voiceover": "string", "textOnScreen": "string"},
    {"time": "3-15s", "visual": "string", "voiceover": "string", "textOnScreen": "string"},
    {"time": "15-30s", "visual": "string", "voiceover": "string", "textOnScreen": "string"},
    {"time": "30-45s", "visual": "string", "voiceover": "string", "textOnScreen": "string"},
    {"time": "45-60s", "visual": "string", "voiceover": "string", "textOnScreen": "string"}
  ],
  "hookStrategy": "string",
  "loopabilityTip": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 1200 });
        try {
            return JSON.parse(resp.content);
        }
        catch {
            return { title: topic, script: [] };
        }
    }
    async generateWebinarScript(topic, duration) {
        const targetDuration = duration ?? 45;
        const prompt = `Write a webinar script about "${topic}" (duration: ${targetDuration} minutes).

Return JSON:
{
  "title": "string",
  "description": "string",
  "learningObjectives": ["string"],
  "targetAudience": "string",
  "script": [
    {"time": "0:00-5:00", "section": "Introduction & Welcome", "speakerNotes": "string", "slides": "string", "engagement": "string"},
    {"time": "string", "section": "string", "speakerNotes": "string", "slides": "string", "engagement": "string"},
    {"time": "string", "section": "Q&A", "speakerNotes": "string", "slides": "string", "engagement": "string"},
    {"time": "string", "section": "Closing & CTA", "speakerNotes": "string", "slides": "string", "engagement": "string"}
  ],
  "preWebinarChecklist": ["string"],
  "postWebinarFollowUp": {"emailSubject": "string", "emailBody": "string"},
  "promotionalCopy": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 3000 });
        try {
            return JSON.parse(resp.content);
        }
        catch {
            return { title: topic, script: [] };
        }
    }
    async generateDemoScript(product) {
        const prompt = `Write a product demo script for:
${JSON.stringify(product, null, 2)}

Return JSON:
{
  "title": "string",
  "duration": "string",
  "targetAudience": "string",
  "prerequisites": ["string"],
  "script": [
    {"time": "0:00-1:00", "section": "Introduction", "speakerNotes": "string", "screenAction": "string"},
    {"time": "string", "section": "Problem Overview", "speakerNotes": "string", "screenAction": "string"},
    {"time": "string", "section": "Solution Demo", "speakerNotes": "string", "screenAction": "string"},
    {"time": "string", "section": "Key Features Walkthrough", "speakerNotes": "string", "screenAction": "string"},
    {"time": "string", "section": "Use Case Example", "speakerNotes": "string", "screenAction": "string"},
    {"time": "string", "section": "Q&A / Next Steps", "speakerNotes": "string", "screenAction": "string"}
  ],
  "keyMessages": ["string"],
  "objectionHandling": [{"objection": "string", "response": "string"}],
  "callToAction": "string"
}`;
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 3000 });
        try {
            return JSON.parse(resp.content);
        }
        catch {
            return { title: product.name, script: [] };
        }
    }
}
