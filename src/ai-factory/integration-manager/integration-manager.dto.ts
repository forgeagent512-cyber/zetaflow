export interface RegisterIntegrationDto {
  organizationId: string;
  name: string;
  provider: string;
  credentials: Record<string, any>;
}

export interface UpdateIntegrationDto {
  name?: string;
  credentials?: Record<string, any>;
}

export interface IntegrationConfigDto {
  id: string;
  organizationId: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  credentials: Record<string, any>;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheckAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationHealthDto {
  status: 'healthy' | 'unhealthy' | 'unknown';
  details?: Record<string, any>;
}

export interface RotateCredentialsDto {
  credentials: Record<string, any>;
}
