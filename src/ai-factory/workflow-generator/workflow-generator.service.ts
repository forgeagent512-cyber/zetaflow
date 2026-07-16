import { randomUUID } from 'node:crypto';
import { NodeBuilder } from './node-builder.js';
import { ConnectionBuilder } from './connection-builder.js';
import { ExpressionBuilder } from './expression-builder.js';
import { CredentialBuilder } from './credential-builder.js';
import { WorkflowValidator } from './workflow-validator.js';
import { WorkflowSerializer } from './workflow-serializer.js';
import { DeploymentPlanner } from './deployment-planner.js';
import { validateWorkflowGeneratorInput } from './workflow-generator.validation.js';
import type { WorkflowGeneratorInputDto, WorkflowDefinitionDto, WorkflowGeneratorOutputDto, WorkflowGeneratorResponseDto } from './workflow-generator.dto.js';
import type { WorkflowGeneratorProvider, WorkflowGeneratorRepository } from './workflow-generator.types.js';

export class WorkflowGeneratorService implements WorkflowGeneratorProvider {
  constructor(
    private readonly repository: WorkflowGeneratorRepository,
    private readonly nodeBuilder: NodeBuilder = new NodeBuilder(),
    private readonly connectionBuilder: ConnectionBuilder = new ConnectionBuilder(),
    private readonly expressionBuilder: ExpressionBuilder = new ExpressionBuilder(),
    private readonly credentialBuilder: CredentialBuilder = new CredentialBuilder(),
    private readonly validator: WorkflowValidator = new WorkflowValidator(),
    private readonly serializer: WorkflowSerializer = new WorkflowSerializer(),
    private readonly deploymentPlanner: DeploymentPlanner = new DeploymentPlanner()
  ) {}

  async generate(input: WorkflowGeneratorInputDto): Promise<WorkflowGeneratorOutputDto> {
    const validated = validateWorkflowGeneratorInput({
      organizationId: input.organizationId,
      industry: input.industry,
      requirements: input.requirements,
      employee: input.employee,
      agents: input.agents
    });

    const workflowType = input.workflowType ?? 'Automation Workflow';
    const workflowName = `${validated.industry} ${workflowType}`;
    const workflowDefinition: WorkflowDefinitionDto = {
      name: workflowName,
      workflowType,
      description: `Production-ready ${validated.industry} workflow generated for ${validated.employee?.name ?? 'operations'}.`,
      nodes: [],
      connections: {},
      settings: {
        executionOrder: 'v1',
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all',
        timezone: 'UTC'
      },
      tags: [validated.industry.toLowerCase(), workflowType.toLowerCase(), 'ai-generated'],
      variables: {
        organizationId: validated.organizationId,
        industry: validated.industry,
        employeeName: (validated.employee as Record<string, unknown>)?.name ?? 'operator'
      },
      metadata: {
        generatedBy: 'AI Factory Workflow Generator',
        generatedAt: new Date().toISOString(),
        requirements: validated.requirements
      }
    };

    workflowDefinition.nodes = this.nodeBuilder.build(workflowDefinition);
    workflowDefinition.connections = this.connectionBuilder.build(workflowDefinition);

    for (const node of workflowDefinition.nodes) {
      if (node.type.includes('httpRequest') || node.type.includes('webhook')) {
        node.parameters = {
          ...node.parameters,
          headers: {
            'x-workflow-id': this.expressionBuilder.buildExpression('workflow.id', 'generated')
          }
        };
      }
    }

    this.validator.validate({
      name: workflowDefinition.name,
      nodes: workflowDefinition.nodes,
      connections: workflowDefinition.connections,
      settings: workflowDefinition.settings,
      tags: workflowDefinition.tags,
      variables: workflowDefinition.variables,
      metadata: workflowDefinition.metadata
    });

    const serialized = this.serializer.serialize({
      name: workflowDefinition.name,
      nodes: workflowDefinition.nodes,
      connections: workflowDefinition.connections,
      settings: workflowDefinition.settings,
      tags: workflowDefinition.tags,
      variables: workflowDefinition.variables,
      metadata: workflowDefinition.metadata
    });

    const requiredCredentials = this.credentialBuilder.build(validated.requirements);
    const deploymentStrategy = this.deploymentPlanner.plan(validated.requirements);

    const workflowJson = {
      ...serialized,
      active: true,
      version: '1.0',
      nodes: workflowDefinition.nodes,
      connections: workflowDefinition.connections,
      settings: workflowDefinition.settings,
      tags: workflowDefinition.tags,
      variables: workflowDefinition.variables,
      metadata: workflowDefinition.metadata,
      credentials: requiredCredentials
    };

    const existing = await this.repository.findSimilarWorkflow(input, workflowName);
    const status: 'active' | 'reused' = existing ? 'reused' : 'active';
    const saved = await this.repository.save({
      id: randomUUID(),
      organizationId: validated.organizationId,
      employeeId: input.employeeId,
      workflowName,
      workflowJson,
      industry: validated.industry,
      status: status === 'reused' ? 'active' : 'active',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      workflow_name: saved.workflowName,
      version: saved.version,
      description: workflowDefinition.description,
      workflow_json: saved.workflowJson,
      required_credentials: requiredCredentials.map((credential) => credential.name),
      required_nodes: workflowDefinition.nodes.map((node) => node.name),
      required_integrations: validated.requirements,
      deployment_strategy: deploymentStrategy
    };
  }
}
