export class ModelOptimizer {
    optimizeFor(model, prompt) {
        switch (model) {
            case 'gemini':
                return `${prompt}\n\nProvider: Gemini. Use structured formatting and compact reasoning.`;
            case 'claude':
                return `${prompt}\n\nProvider: Claude. Write with clarity, policy, and deliberate reasoning.`;
            case 'openai':
                return `${prompt}\n\nProvider: OpenAI. Keep instructions explicit and deterministic.`;
            default:
                return `${prompt}\n\nProvider: Generic. Keep instructions reliable and business-oriented.`;
        }
    }
}
