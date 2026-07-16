export class DocumentParser {
  parse(content: string, title: string): { text: string; summary: string; metadata: Record<string, unknown> } {
    const normalized = content.replace(/\s+/g, ' ').trim();
    return {
      text: normalized,
      summary: normalized.slice(0, 180) || `Knowledge entry for ${title}`,
      metadata: {
        title,
        wordCount: normalized.split(/\s+/).filter(Boolean).length,
        parsedAt: new Date().toISOString()
      }
    };
  }
}
