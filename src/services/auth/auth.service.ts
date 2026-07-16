import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  organizationId: string;
  role: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserRecord {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

export class AuthService {
  private refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

  generateTokens(payload: TokenPayload): AuthTokens {
    const secret = getJwtSecret();
    const accessToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    const refreshToken = randomUUID();
    const expiresIn = 3600;

    this.refreshTokens.set(refreshToken, {
      userId: payload.userId,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    });

    return { accessToken, refreshToken, expiresIn };
  }

  verifyToken(token: string): TokenPayload {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as TokenPayload;
  }

  refreshAccessToken(refreshToken: string): AuthTokens | null {
    const stored = this.refreshTokens.get(refreshToken);
    if (!stored || stored.expiresAt < Date.now()) {
      this.refreshTokens.delete(refreshToken);
      return null;
    }
    this.refreshTokens.delete(refreshToken);

    const payload: TokenPayload = {
      userId: stored.userId,
      organizationId: '',
      role: 'customer',
      email: '',
    };

    return this.generateTokens(payload);
  }

  revokeRefreshToken(refreshToken: string): void {
    this.refreshTokens.delete(refreshToken);
  }

  hasPermission(userRole: string, requiredPermission: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      'Super Admin': ['*'],
      'Organization Admin': ['manage_users', 'manage_workflows', 'manage_ai_employees', 'manage_billing', 'view_dashboard', 'manage_settings'],
      Manager: ['manage_workflows', 'manage_ai_employees', 'view_dashboard'],
      Customer: ['view_dashboard'],
    };

    const permissions = rolePermissions[userRole] ?? [];
    return permissions.includes('*') || permissions.includes(requiredPermission);
  }
}
