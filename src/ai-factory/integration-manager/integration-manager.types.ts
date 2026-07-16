import type { IntegrationConfigDto } from './integration-manager.dto.js';

export interface IntegrationRecord {
  id: string;
  organizationId: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  encryptedCredentials: string;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheckAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationRepository {
  findById(id: string): Promise<IntegrationRecord | null>;
  findByOrganizationId(organizationId: string): Promise<IntegrationRecord[]>;
  save(record: IntegrationRecord): Promise<IntegrationRecord>;
  delete(id: string): Promise<boolean>;
}
