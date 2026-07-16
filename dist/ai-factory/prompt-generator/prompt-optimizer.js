export class PromptOptimizer {
    optimize(prompt, model) {
        const base = prompt.trim();
        switch (model) {
            case 'gemini':
                return `${base}\n\nOptimization: Use concise, structured instructions. Favor bullet points and explicit JSON output.`;
            case 'openai':
                return `${base}\n\nOptimization: Prioritize behavior constraints, tools, and deterministic instruction ordering.`;
            case 'claude':
                return `${base}\n\nOptimization: Emphasize clarity, policy adherence, and step-by-step reasoning.`;
            case 'deepseek':
                return `${base}\n\nOptimization: Use compact, exact instructions with low ambiguity.`;
            default:
                return `${base}\n\nOptimization: Keep the prompt reliable, compliant, and business-focused.`;
        }
    }
}
