import { randomUUID } from 'node:crypto';
import { validateAgentGeneratorInput, validateAgentCollection } from './agent-generator.validation.js';
import { AgentPromptBuilder } from './agent-prompt-builder.js';
import { CommunicationPlanner } from './communication-planner.js';
import { HierarchyBuilder } from './hierarchy-builder.js';
export class AgentGeneratorService {
    repository;
    provider;
    promptBuilder;
    communicationPlanner;
    hierarchyBuilder;
    constructor(repository, provider, promptBuilder = new AgentPromptBuilder(), communicationPlanner = new CommunicationPlanner(), hierarchyBuilder = new HierarchyBuilder()) {
        this.repository = repository;
        this.provider = provider;
        this.promptBuilder = promptBuilder;
        this.communicationPlanner = communicationPlanner;
        this.hierarchyBuilder = hierarchyBuilder;
    }
    async generate(input) {
        const validated = validateAgentGeneratorInput({
            ...input,
            required_tools: input.required_tools
        });
        const generated = await this.provider.generate({
            ...input,
            required_tools: input.required_tools ?? ['workflow_engine', 'crm_api']
        });
        const agents = validateAgentCollection(generated.agents);
        const communicationPlan = this.communicationPlanner.plan(agents);
        const hierarchy = this.hierarchyBuilder.build(agents);
        const payload = {
            employee_name: generated.employee_name,
            agents: agents.map((agent, index) => ({
                ...agent,
                communication_rules: {
                    ...agent.communication_rules,
                    communication_plan: communicationPlan,
                    hierarchy
                },
                required_workflows: Array.isArray(agent.required_workflows) ? agent.required_workflows : validated.workflows,
                required_integrations: Array.isArray(agent.required_integrations) ? agent.required_integrations : validated.integrations
            }))
        };
        const employeeId = input.correlationId ?? randomUUID();
        for (const agent of payload.agents) {
            const record = {
                id: randomUUID(),
                organizationId: input.organizationId ?? 'system',
                employeeId,
                agentName: agent.agent_name,
                agentRole: agent.role,
                industry: validated.industry,
                systemPrompt: agent.system_prompt,
                agentJson: agent,
                status: 'active',
                version: '1.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: input.requestedBy
            };
            await this.repository.save(record);
        }
        return {
            id: randomUUID(),
            status: 'completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            organizationId: input.organizationId ?? 'system',
            input,
            agents: payload
        };
    }
}
