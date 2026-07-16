import type { DeploymentManagerInputDto, DeploymentReportDto } from './deployment-manager.dto.js';

export interface DeploymentRecord {
  id: string;
  organizationId: string;
  status: 'success' | 'failed' | 'rolled_back';
  report: DeploymentReportDto;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentRepository {
  save(record: DeploymentRecord): Promise<DeploymentRecord>;
  findById(id: string): Promise<DeploymentRecord | null>;
}

export interface DeploymentService {
  deploy(input: DeploymentManagerInputDto): Promise<DeploymentReportDto>;
}
