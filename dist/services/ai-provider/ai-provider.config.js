function getEnvConfig(apiKeyVar, baseUrlVar, timeoutVar, retriesVar, defaultBaseUrl, providerName) {
    const apiKey = process.env[apiKeyVar]?.trim();
    if (!apiKey) {
        throw new Error(`${apiKeyVar} is required for ${providerName}`);
    }
    return {
        apiKey,
        baseUrl: process.env[baseUrlVar]?.trim() ?? defaultBaseUrl,
        timeoutMs: Number.parseInt(process.env[timeoutVar] ?? '30000', 10),
        retries: Number.parseInt(process.env[retriesVar] ?? '3', 10)
    };
}
export function getOpenRouterConfig() {
    return getEnvConfig('OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL', 'OPENROUTER_TIMEOUT_MS', 'OPENROUTER_RETRIES', 'https://openrouter.ai/api/v1', 'OpenRouter');
}
export function getOpenAIConfig() {
    return getEnvConfig('OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_TIMEOUT_MS', 'OPENAI_RETRIES', 'https://api.openai.com/v1', 'OpenAI');
}
export function getAnthropicConfig() {
    return getEnvConfig('ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_TIMEOUT_MS', 'ANTHROPIC_RETRIES', 'https://api.anthropic.com/v1', 'Anthropic');
}
export function getGeminiConfig() {
    return getEnvConfig('GEMINI_API_KEY', 'GEMINI_BASE_URL', 'GEMINI_TIMEOUT_MS', 'GEMINI_RETRIES', 'https://generativelanguage.googleapis.com/v1beta', 'Gemini');
}
export function validateOpenRouterConfig() {
    return getOpenRouterConfig();
}
