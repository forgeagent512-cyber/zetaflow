import type { Auditable } from '../shared/contracts.js';
import type { EmployeeGeneratorInputDto, EmployeeGeneratorOutputDto } from './employee-generator.dto.js';

export interface GeneratedEmployeeRecord extends Auditable {
  organizationId: string;
  employeeName: string;
  department: string;
  industry: string;
  systemPrompt: string;
  employeeJson: EmployeeGeneratorOutputDto;
  status: 'draft' | 'active' | 'disabled';
  version: string;
}

export interface EmployeeGeneratorProvider {
  generate(input: EmployeeGeneratorInputDto): Promise<EmployeeGeneratorOutputDto>;
}
