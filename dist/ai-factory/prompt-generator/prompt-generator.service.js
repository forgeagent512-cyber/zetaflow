import { randomUUID } from 'node:crypto';
import { PromptBuilder } from './prompt-builder.js';
import { PromptOptimizer } from './prompt-optimizer.js';
import { PromptValidator } from './prompt-validator.js';
import { PromptSerializer } from './prompt-serializer.js';
import { validatePromptGeneratorInput } from './prompt-generator.validation.js';
export class PromptGeneratorService {
    repository;
    promptBuilder;
    optimizer;
    validator;
    serializer;
    constructor(repository, promptBuilder = new PromptBuilder(), optimizer = new PromptOptimizer(), validator = new PromptValidator(), serializer = new PromptSerializer()) {
        this.repository = repository;
        this.promptBuilder = promptBuilder;
        this.optimizer = optimizer;
        this.validator = validator;
        this.serializer = serializer;
    }
    async generate(input) {
        const validated = validatePromptGeneratorInput({
            organizationId: input.organizationId,
            employee: input.employee,
            agent: input.agent,
            requirements: input.requirements,
            promptType: input.promptType
        });
        const model = input.model ?? 'gemini';
        const packageDraft = this.promptBuilder.build(input, model);
        const optimizedSystem = this.optimizer.optimize(packageDraft.system_prompt, model);
        const optimizedDeveloper = this.optimizer.optimize(packageDraft.developer_prompt, model);
        const optimizedAssistant = this.optimizer.optimize(packageDraft.assistant_prompt, model);
        const promptPackage = {
            ...packageDraft,
            system_prompt: optimizedSystem,
            developer_prompt: optimizedDeveloper,
            assistant_prompt: optimizedAssistant,
            prompt_json: {
                ...packageDraft.prompt_json,
                model,
                optimization: `optimized-for-${model}`
            }
        };
        this.validator.validate(promptPackage);
        const existing = await this.repository.findByName(promptPackage.prompt_name);
        const record = {
            id: randomUUID(),
            organizationId: validated.organizationId,
            employeeId: input.employeeId,
            agentId: input.agentId,
            promptName: promptPackage.prompt_name,
            promptType: promptPackage.prompt_type,
            systemPrompt: promptPackage.system_prompt,
            developerPrompt: promptPackage.developer_prompt,
            assistantPrompt: promptPackage.assistant_prompt,
            promptJson: promptPackage.prompt_json,
            version: promptPackage.version,
            status: promptPackage.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const saved = await this.repository.save(record);
        return {
            id: saved.id,
            organizationId: saved.organizationId,
            employeeId: saved.employeeId,
            agentId: saved.agentId,
            prompt_name: saved.promptName,
            prompt_type: saved.promptType,
            system_prompt: saved.systemPrompt,
            developer_prompt: saved.developerPrompt,
            assistant_prompt: saved.assistantPrompt,
            prompt_json: saved.promptJson,
            version: saved.version,
            status: saved.status,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt
        };
    }
}
