export class MetadataExtractor {
  extract(text: string, sourceType: string): Record<string, unknown> {
    return {
      sourceType,
      language: this.detectLanguage(text),
      tags: this.extractTags(text),
      generatedAt: new Date().toISOString()
    };
  }

  private detectLanguage(text: string): string {
    return /[\u0600-\u06FF]/.test(text) ? 'Arabic' : 'English';
  }

  private extractTags(text: string): string[] {
    const keywords = text.toLowerCase().match(/\b(knowledge|policy|faq|sop|sales|support|finance|hr|operations)\b/g) ?? [];
    return [...new Set(keywords)];
  }
}
