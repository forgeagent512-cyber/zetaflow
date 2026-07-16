import type { Request, Response, NextFunction } from 'express';
import { AuthService, type TokenPayload } from '../services/auth/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      organizationId?: string;
    }
  }
}

const authService = new AuthService();

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    req.organizationId = payload.organizationId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = authService.verifyToken(authHeader.slice(7));
      req.user = payload;
      req.organizationId = payload.organizationId;
    } catch {
    }
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role) && !roles.includes('*')) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const hasPermission = authService.hasPermission(req.user.role, permission);
    if (!hasPermission) {
      res.status(403).json({ success: false, message: `Missing permission: ${permission}` });
      return;
    }
    next();
  };
}
