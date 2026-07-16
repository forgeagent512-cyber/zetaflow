import { randomUUID } from 'node:crypto';
import type { EmployeeGeneratorInputDto, EmployeeGeneratorOutputDto, EmployeeGeneratorResponseDto } from './employee-generator.dto.js';
import type { EmployeeRepository } from './employee-generator.repository.js';
import { validateEmployeeGeneratorInput, validateGeneratedEmployee } from './employee-generator.validation.js';
import type { EmployeeGeneratorProvider } from './employee-generator.types.js';
import { PromptBuilder, KnowledgeBuilder, EmployeeSerializer } from './prompt-builder.js';

export interface IEmployeeGeneratorService {
  generate(input: EmployeeGeneratorInputDto): Promise<EmployeeGeneratorResponseDto>;
}

export class EmployeeGeneratorService implements IEmployeeGeneratorService {
  constructor(
    private readonly repository: EmployeeRepository,
    private readonly provider: EmployeeGeneratorProvider,
    private readonly promptBuilder: PromptBuilder = new PromptBuilder(),
    private readonly knowledgeBuilder: KnowledgeBuilder = new KnowledgeBuilder(),
    private readonly serializer: EmployeeSerializer = new EmployeeSerializer()
  ) {}

  async generate(input: EmployeeGeneratorInputDto): Promise<EmployeeGeneratorResponseDto> {
    const validated = validateEmployeeGeneratorInput({
      ...input,
      organizationId: input.organizationId
    });

    const existing = await this.repository.findByName(`${validated.business_name} ${validated.automation_type} Employee`);
    if (existing) {
      throw new Error('An employee with this name already exists');
    }

    const prompt = this.promptBuilder.build({
      ...input,
      industry: validated.industry,
      automation_type: validated.automation_type,
      business_name: validated.business_name,
      requirements: validated.requirements,
      organizationId: input.organizationId,
      requestedBy: input.requestedBy,
      correlationId: input.correlationId
    });

    const employee = await this.provider.generate({
      ...input,
      organizationId: input.organizationId,
      requestedBy: input.requestedBy,
      correlationId: input.correlationId,
      industry: validated.industry,
      automation_type: validated.automation_type,
      business_name: validated.business_name,
      requirements: validated.requirements
    });

    const normalizedEmployee = validateGeneratedEmployee({
      ...employee,
      knowledge_base: employee.knowledge_base ?? this.knowledgeBuilder.build({
        ...input,
        organizationId: input.organizationId,
        requestedBy: input.requestedBy,
        correlationId: input.correlationId,
        industry: validated.industry,
        automation_type: validated.automation_type,
        business_name: validated.business_name,
        requirements: validated.requirements
      }),
      system_prompt: employee.system_prompt?.trim() ? employee.system_prompt : prompt
    });

    const normalizedEmployeeDto = normalizedEmployee as unknown as EmployeeGeneratorOutputDto;

    const entity = {
      id: randomUUID(),
      organizationId: input.organizationId ?? 'system',
      employeeName: normalizedEmployeeDto.employee_name as string,
      department: normalizedEmployeeDto.department as string,
      industry: validated.industry,
      systemPrompt: normalizedEmployeeDto.system_prompt as string,
      employeeJson: normalizedEmployeeDto,
      status: 'active' as const,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: input.requestedBy
    };

    await this.repository.save(entity);

    return {
      id: entity.id,
      status: 'completed',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      organizationId: entity.organizationId,
      input: {
        ...input,
        organizationId: entity.organizationId,
        requestedBy: input.requestedBy,
        correlationId: input.correlationId
      },
      employee: normalizedEmployeeDto
    };
  }
}
