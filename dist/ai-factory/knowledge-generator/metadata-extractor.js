export class MetadataExtractor {
    extract(text, sourceType) {
        return {
            sourceType,
            language: this.detectLanguage(text),
            tags: this.extractTags(text),
            generatedAt: new Date().toISOString()
        };
    }
    detectLanguage(text) {
        return /[\u0600-\u06FF]/.test(text) ? 'Arabic' : 'English';
    }
    extractTags(text) {
        const keywords = text.toLowerCase().match(/\b(knowledge|policy|faq|sop|sales|support|finance|hr|operations)\b/g) ?? [];
        return [...new Set(keywords)];
    }
}
