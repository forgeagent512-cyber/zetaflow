export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
}

export function getN8nConfig(): N8nConfig | null {
  const baseUrl = process.env.N8N_BASE_URL?.trim();
  const apiKey = process.env.N8N_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    apiKey,
    timeoutMs: Number.parseInt(process.env.N8N_TIMEOUT_MS ?? '30000', 10)
  };
}

export function validateN8nConfig(): N8nConfig | null {
  return getN8nConfig();
}
