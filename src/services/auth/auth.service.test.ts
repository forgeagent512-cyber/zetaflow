import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service.js';

test('rejects none algorithm tokens', () => {
  process.env.JWT_SECRET = 'test-secret';
  const service = new AuthService();
  const token = jwt.sign({ userId: 'u1', organizationId: 'org1', role: 'Customer', email: 'a@example.com' }, 'ignored', { algorithm: 'none' as jwt.Algorithm });

  assert.throws(() => service.verifyToken(token), /Invalid or unsupported token/i);
});

test('rejects unexpected signing algorithms', () => {
  process.env.JWT_SECRET = 'test-secret';
  const service = new AuthService();
  const token = jwt.sign({ userId: 'u1', organizationId: 'org1', role: 'Customer', email: 'a@example.com' }, 'test-secret', { algorithm: 'HS384' as jwt.Algorithm });

  assert.throws(() => service.verifyToken(token), /Invalid or unsupported token/i);
});

test('refresh preserves organization and role claims', () => {
  process.env.JWT_SECRET = 'test-secret';
  const service = new AuthService();
  const tokens = service.generateTokens({ userId: 'u1', organizationId: 'org-123', role: 'Organization Admin', email: 'owner@example.com' });

  const refreshed = service.refreshAccessToken(tokens.refreshToken);
  assert.ok(refreshed);
  const payload = service.verifyToken(refreshed!.accessToken);
  assert.equal(payload.organizationId, 'org-123');
  assert.equal(payload.role, 'Organization Admin');
  assert.equal(payload.email, 'owner@example.com');
});
