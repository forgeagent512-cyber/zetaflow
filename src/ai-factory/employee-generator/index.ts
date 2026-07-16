import type { AiFactoryRequest, AiFactoryResponse, Auditable } from '../shared/contracts.js';
import type { Repository } from '../shared/repositories.js';
import { InMemoryRepository } from '../shared/repositories.js';

export interface EmployeeModel extends Auditable {
  solutionArchitectureId: string;
  employeeType: string;
  role: string;
  capabilities: string[];
}

export interface EmployeeGenerationRequestDto extends AiFactoryRequest {
  solutionArchitectureId: string;
  employeeType: string;
}

export interface EmployeeGenerationResultDto extends AiFactoryResponse {
  employee: EmployeeModel;
}

export interface EmployeeRepository extends Repository<EmployeeModel> {
  findBySolutionArchitectureId(solutionArchitectureId: string): Promise<EmployeeModel[]>;
}

export class InMemoryEmployeeRepository extends InMemoryRepository<EmployeeModel> implements EmployeeRepository {
  async findBySolutionArchitectureId(solutionArchitectureId: string): Promise<EmployeeModel[]> {
    return [];
  }
}

export interface IEmployeeGeneratorService {
  generate(request: EmployeeGenerationRequestDto): Promise<EmployeeGenerationResultDto>;
}

export { EmployeeGeneratorService } from './employee-generator.service.js';
