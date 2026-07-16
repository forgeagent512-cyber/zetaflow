import { randomUUID } from 'node:crypto';
import type {
  RegisterIntegrationDto,
  UpdateIntegrationDto,
  IntegrationConfigDto,
  IntegrationHealthDto,
} from './integration-manager.dto.js';
import {
  validateRegisterIntegration,
  validateUpdateIntegration,
} from './integration-manager.validation.js';
import type { IntegrationRepository, IntegrationRecord } from './integration-manager.types.js';

function encrypt(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data), 'utf-8').toString('base64');
}

function decrypt(encoded: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
}

function toConfigDto(record: IntegrationRecord): IntegrationConfigDto {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    provider: record.provider,
    status: record.status,
    credentials: decrypt(record.encryptedCredentials),
    healthStatus: record.healthStatus,
    lastHealthCheckAt: record.lastHealthCheckAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class IntegrationManagerService {
  constructor(private readonly repository: IntegrationRepository) {}

  async register(dto: RegisterIntegrationDto): Promise<IntegrationConfigDto> {
    const validated = validateRegisterIntegration(dto);
    const now = new Date().toISOString();
    const record: IntegrationRecord = {
      id: randomUUID(),
      organizationId: validated.organizationId,
      name: validated.name,
      provider: validated.provider,
      status: 'active',
      encryptedCredentials: encrypt(validated.credentials),
      healthStatus: 'unknown',
      createdAt: now,
      updatedAt: now,
    };
    const saved = await this.repository.save(record);
    return toConfigDto(saved);
  }

  async update(id: string, dto: UpdateIntegrationDto): Promise<IntegrationConfigDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Integration with id '${id}' not found`);
    }
    const validated = validateUpdateIntegration(dto);
    const updated: IntegrationRecord = {
      ...existing,
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.credentials !== undefined && {
        encryptedCredentials: encrypt(validated.credentials),
      }),
      updatedAt: new Date().toISOString(),
    };
    const saved = await this.repository.save(updated);
    return toConfigDto(saved);
  }

  async findByOrganization(organizationId: string): Promise<IntegrationConfigDto[]> {
    const records = await this.repository.findByOrganizationId(organizationId);
    return records.map(toConfigDto);
  }

  async healthCheck(id: string): Promise<IntegrationHealthDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Integration with id '${id}' not found`);
    }
    const isHealthy = existing.status === 'active';
    const healthStatus = isHealthy ? 'healthy' : 'unhealthy';
    const now = new Date().toISOString();
    await this.repository.save({
      ...existing,
      healthStatus,
      lastHealthCheckAt: now,
      updatedAt: now,
    });
    return {
      status: healthStatus,
      details: { provider: existing.provider, checkedAt: now },
    };
  }

  async rotateCredentials(id: string): Promise<IntegrationConfigDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Integration with id '${id}' not found`);
    }
    const currentCredentials = decrypt(existing.encryptedCredentials);
    const rotatedCredentials: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(currentCredentials)) {
      rotatedCredentials[key] = typeof value === 'string' ? `${value}_rotated` : value;
    }
    const now = new Date().toISOString();
    const updated: IntegrationRecord = {
      ...existing,
      encryptedCredentials: encrypt(rotatedCredentials),
      updatedAt: now,
    };
    const saved = await this.repository.save(updated);
    return toConfigDto(saved);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
