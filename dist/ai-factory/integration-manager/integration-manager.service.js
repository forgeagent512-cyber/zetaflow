import { randomUUID } from 'node:crypto';
import { validateRegisterIntegration, validateUpdateIntegration, } from './integration-manager.validation.js';
function encrypt(data) {
    return Buffer.from(JSON.stringify(data), 'utf-8').toString('base64');
}
function decrypt(encoded) {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
}
function toConfigDto(record) {
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
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async register(dto) {
        const validated = validateRegisterIntegration(dto);
        const now = new Date().toISOString();
        const record = {
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
    async update(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new Error(`Integration with id '${id}' not found`);
        }
        const validated = validateUpdateIntegration(dto);
        const updated = {
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
    async findByOrganization(organizationId) {
        const records = await this.repository.findByOrganizationId(organizationId);
        return records.map(toConfigDto);
    }
    async healthCheck(id) {
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
    async rotateCredentials(id) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new Error(`Integration with id '${id}' not found`);
        }
        const currentCredentials = decrypt(existing.encryptedCredentials);
        const rotatedCredentials = {};
        for (const [key, value] of Object.entries(currentCredentials)) {
            rotatedCredentials[key] = typeof value === 'string' ? `${value}_rotated` : value;
        }
        const now = new Date().toISOString();
        const updated = {
            ...existing,
            encryptedCredentials: encrypt(rotatedCredentials),
            updatedAt: now,
        };
        const saved = await this.repository.save(updated);
        return toConfigDto(saved);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
}
