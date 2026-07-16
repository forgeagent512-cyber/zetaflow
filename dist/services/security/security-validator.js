export class SecurityValidator {
    async validateInput(input, schema) {
        const errors = [];
        if (!input) {
            errors.push('Input is required');
            return { valid: false, errors };
        }
        return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    }
    async detectPromptInjection(input) {
        const injectionPatterns = [
            /ignore\s+(all\s+)?previous\s+(instructions|context)/i,
            /forget\s+(all\s+)?(previous\s+)?context/i,
            /system\s+prompt/i,
            /<system>.*?<\/system>/is,
            /you\s+are\s+(now\s+)?an?\s+(AI|assistant|chatbot|agent)/i,
        ];
        const found = [];
        for (const pattern of injectionPatterns) {
            if (pattern.test(input)) {
                found.push(pattern.source);
            }
        }
        return { isInjection: found.length > 0, confidence: found.length > 0 ? 0.8 : 0, patterns: found };
    }
}
