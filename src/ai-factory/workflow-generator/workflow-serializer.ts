export class WorkflowSerializer {
  serialize(workflow: Record<string, unknown>): Record<string, unknown> {
    return {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings,
      tags: workflow.tags,
      variables: workflow.variables,
      metadata: workflow.metadata
    };
  }
}
