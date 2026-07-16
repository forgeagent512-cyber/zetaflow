import type { Request, Response, NextFunction } from 'express';

const HEADERS_TO_REMOVE = [
  'x-powered-by',
  'server',
  'x-n8n',
  'x-supabase',
  'x-railway',
];

const PATTERNS_TO_REPLACE: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /n8n/gi, replacement: 'BUILDAGENT' },
  { pattern: /openrouter/gi, replacement: 'BUILDAGENT AI' },
  { pattern: /supabase/gi, replacement: 'BUILDAGENT Data' },
  { pattern: /railway/gi, replacement: 'BUILDAGENT Cloud' },
  { pattern: /OpenRouter/i, replacement: 'BUILDAGENT AI' },
  { pattern: /Supabase/i, replacement: 'BUILDAGENT Data' },
  { pattern: /Railway/i, replacement: 'BUILDAGENT Cloud' },
  { pattern: /N8N/i, replacement: 'BUILDAGENT' },
];

export function whitelabelHeaders(_req: Request, res: Response, next: NextFunction): void {
  for (const header of HEADERS_TO_REMOVE) {
    res.removeHeader(header);
  }
  res.setHeader('X-Powered-By', 'BUILDAGENT');
  res.setHeader('X-Brand', 'BUILDAGENT');
  next();
}

export function whitelabelResponseBody(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown): Response {
    if (body && typeof body === 'object') {
      const sanitized = sanitizeObject(body as Record<string, unknown>);
      return originalJson(sanitized);
    }
    if (typeof body === 'string') {
      return originalJson(sanitizeString(body));
    }
    return originalJson(body);
  };
  next();
}

export function sanitizeString(text: string): string {
  let result = text;
  for (const { pattern, replacement } of PATTERNS_TO_REPLACE) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : typeof item === 'string'
            ? sanitizeString(item)
            : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const whitelabel = [whitelabelHeaders, whitelabelResponseBody];
