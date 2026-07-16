import { randomUUID } from 'node:crypto';
import { validateEmployeeGeneratorInput, validateGeneratedEmployee } from './employee-generator.validation.js';
import { PromptBuilder, KnowledgeBuilder, EmployeeSerializer } from './prompt-builder.js';
export class EmployeeGeneratorService {
    repository;
    provider;
    promptBuilder;
    knowledgeBuilder;
    serializer;
    constructor(repository, provider, promptBuilder = new PromptBuilder(), knowledgeBuilder = new KnowledgeBuilder(), serializer = new EmployeeSerializer()) {
        this.repository = repository;
        this.provider = provider;
        this.promptBuilder = promptBuilder;
        this.knowledgeBuilder = knowledgeBuilder;
        this.serializer = serializer;
    }
    async generate(input) {
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
        const normalizedEmployeeDto = normalizedEmployee;
        const entity = {
            id: randomUUID(),
            organizationId: input.organizationId ?? 'system',
            employeeName: normalizedEmployeeDto.employee_name,
            department: normalizedEmployeeDto.department,
            industry: validated.industry,
            systemPrompt: normalizedEmployeeDto.system_prompt,
            employeeJson: normalizedEmployeeDto,
            status: 'active',
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
