import crypto from 'node:crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

interface SchemaRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  properties?: Record<string, SchemaRule>;
  items?: SchemaRule;
}

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|below)\s+instructions/i,
  /forget\s+(all\s+)?(previous|above|below)\s+(instructions|context)/i,
  /you\s+(are|were)\s+told/i,
  /system\s+prompt/i,
  /do\s+not\s+(follow|obey|listen)/i,
  /new\s+instructions/i,
  /override/i,
  /disregard/i,
  /<\s*system\s*>.*?<\s*\/\s*system\s*>/is,
  /<\s*assistant\s*>.*?<\s*\/\s*assistant\s*>/is,
  /role\s*[:=]\s*["']?(system|assistant)["']?/i,
  /you\s+are\s+now\s+(an?\s+)?(ai|assistant|chatbot|agent)/i,
];

const SENSITIVE_FIELDS = ['password', 'secret', 'token', 'api_key', 'apiKey', 'key_hash', 'keyHash', 'credit_card', 'creditCard', 'ssn', 'authorization', 'Authorization'];

export class SecurityCenter {
  validateInput(data: Record<string, any>, schema: Record<string, SchemaRule>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value === undefined || value === null) continue;
      if (rule.type === 'email' && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
      if (rule.type === 'url' && typeof value === 'string' && !/^https?:\/\/.+/.test(value)) {
        errors.push(`${field} must be a valid URL`);
      }
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
      if (typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) errors.push(`${field} must be at least ${rule.min} characters`);
        if (rule.max !== undefined && value.length > rule.max) errors.push(`${field} must be at most ${rule.max} characters`);
        if (rule.pattern && !new RegExp(rule.pattern).test(value)) errors.push(`${field} format is invalid`);
      }
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) errors.push(`${field} must be at least ${rule.min}`);
        if (rule.max !== undefined && value > rule.max) errors.push(`${field} must be at most ${rule.max}`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
      if (rule.type === 'array' && Array.isArray(value) && rule.items) {
        value.forEach((item, i) => {
          const nested = this.validateInput({ item }, { item: rule.items! });
          nested.errors.forEach(e => errors.push(`${field}[${i}]: ${e}`));
        });
      }
      if (rule.type === 'object' && typeof value === 'object' && !Array.isArray(value) && rule.properties) {
        const nested = this.validateInput(value, rule.properties);
        nested.errors.forEach(e => errors.push(`${field}.${e}`));
      }
    }
    return { valid: errors.length === 0, errors };
  }

  sanitizeOutput(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) continue;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.sanitizeOutput(value);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => item !== null && typeof item === 'object' ? this.sanitizeOutput(item) : item);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  detectPromptInjection(prompt: string): { detected: boolean; matches: string[] } {
    const matches: string[] = [];
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        matches.push(pattern.source);
      }
    }
    return { detected: matches.length > 0, matches };
  }

  encryptSecret(value: string): { encrypted: string; iv: string; keyId: string } {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
      encrypted: `${encrypted}:${authTag}`,
      iv: iv.toString('hex'),
      keyId: 'current',
    };
  }

  decryptSecret(encrypted: string, iv: string, keyId: string): string {
    const key = this.getEncryptionKey(keyId);
    const [ciphertext, authTag] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag ?? '', 'hex'));
    let decrypted = decipher.update(ciphertext ?? '', 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;
    const expected = crypto.createHash('sha256').update(sessionToken).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  }

  private getEncryptionKey(keyId?: string): Buffer {
    const baseKey = process.env.ENCRYPTION_KEY ?? process.env.SECRET_KEY;
    if (!baseKey) throw new Error('Encryption key not configured');
    if (keyId && keyId !== 'current') {
      const keys = (process.env.ENCRYPTION_KEYS ?? '').split(',').map(k => k.trim());
      const found = keys.find(k => k.startsWith(`${keyId}:`));
      if (found) return Buffer.from(found.split(':')[1] ?? '', 'hex');
    }
    return crypto.scryptSync(baseKey, 'salt', 32);
  }
}
