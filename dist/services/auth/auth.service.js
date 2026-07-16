import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
function getJwtSecrets() {
    const secrets = [process.env.JWT_SECRET, process.env.JWT_SECRET_PREVIOUS].filter((secret) => Boolean(secret));
    if (secrets.length === 0) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return secrets;
}
function getJwtOptions() {
    return {
        algorithm: (process.env.JWT_ALGORITHM ?? 'HS256'),
        issuer: process.env.JWT_ISSUER ?? 'buildagent',
        audience: process.env.JWT_AUDIENCE ?? 'buildagent-api',
        expiresIn: Number(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600'),
    };
}
export class AuthService {
    refreshTokens = new Map();
    generateTokens(payload) {
        const secrets = getJwtSecrets();
        const options = getJwtOptions();
        const accessToken = jwt.sign(payload, secrets[0], {
            algorithm: options.algorithm,
            issuer: options.issuer,
            audience: options.audience,
            expiresIn: options.expiresIn,
        });
        const refreshToken = randomUUID();
        const expiresIn = 3600;
        this.refreshTokens.set(refreshToken, {
            payload,
            expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
            revoked: false,
        });
        return { accessToken, refreshToken, expiresIn };
    }
    verifyToken(token) {
        const secrets = getJwtSecrets();
        const options = getJwtOptions();
        for (const secret of secrets) {
            try {
                const decoded = jwt.verify(token, secret, {
                    algorithms: [options.algorithm],
                    issuer: options.issuer,
                    audience: options.audience,
                });
                if (!decoded.userId || !decoded.organizationId || !decoded.role || !decoded.email) {
                    throw new Error('Incomplete token payload');
                }
                return {
                    userId: decoded.userId,
                    organizationId: decoded.organizationId,
                    role: decoded.role,
                    email: decoded.email,
                };
            }
            catch (error) {
                if (error instanceof Error && /invalid|expired|signature|algorithm|issuer|audience|jwt/i.test(error.message)) {
                    continue;
                }
                throw error;
            }
        }
        throw new Error('Invalid or unsupported token');
    }
    refreshAccessToken(refreshToken) {
        const stored = this.refreshTokens.get(refreshToken);
        if (!stored || stored.revoked || stored.expiresAt < Date.now()) {
            this.refreshTokens.delete(refreshToken);
            return null;
        }
        const { payload } = stored;
        this.refreshTokens.delete(refreshToken);
        const newRefreshToken = randomUUID();
        this.refreshTokens.set(newRefreshToken, {
            payload,
            expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
            revoked: false,
        });
        const secrets = getJwtSecrets();
        const accessToken = jwt.sign(payload, secrets[0], {
            algorithm: getJwtOptions().algorithm,
            issuer: getJwtOptions().issuer,
            audience: getJwtOptions().audience,
            expiresIn: getJwtOptions().expiresIn,
        });
        return { accessToken, refreshToken: newRefreshToken, expiresIn: 3600 };
    }
    revokeRefreshToken(refreshToken) {
        const stored = this.refreshTokens.get(refreshToken);
        if (stored) {
            stored.revoked = true;
        }
        this.refreshTokens.delete(refreshToken);
    }
    revokeRefreshTokensForUser(userId) {
        for (const [token, record] of this.refreshTokens.entries()) {
            if (record.payload.userId === userId) {
                record.revoked = true;
                this.refreshTokens.delete(token);
            }
        }
    }
    hasPermission(userRole, requiredPermission) {
        const rolePermissions = {
            'Super Admin': ['*'],
            'Organization Admin': ['manage_users', 'manage_workflows', 'manage_ai_employees', 'manage_billing', 'view_dashboard', 'manage_settings'],
            Manager: ['manage_workflows', 'manage_ai_employees', 'view_dashboard'],
            Customer: ['view_dashboard'],
        };
        const permissions = rolePermissions[userRole] ?? [];
        return permissions.includes('*') || permissions.includes(requiredPermission);
    }
}
