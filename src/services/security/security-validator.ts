export class SecurityValidator {
  async validateInput(input: unknown, schema: Record<string, unknown>): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];
    if (!input) {
      errors.push('Input is required');
      return { valid: false, errors };
    }
    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  async detectPromptInjection(input: string): Promise<{ isInjection: boolean; confidence: number; patterns: string[] }> {
    const injectionPatterns = [
      /ignore\s+(all\s+)?previous\s+(instructions|context)/i,
      /forget\s+(all\s+)?(previous\s+)?context/i,
      /system\s+prompt/i,
      /<system>.*?<\/system>/is,
      /you\s+are\s+(now\s+)?an?\s+(AI|assistant|chatbot|agent)/i,
    ];
    const found: string[] = [];
    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        found.push(pattern.source);
      }
    }
    return { isInjection: found.length > 0, confidence: found.length > 0 ? 0.8 : 0, patterns: found };
  }
}
