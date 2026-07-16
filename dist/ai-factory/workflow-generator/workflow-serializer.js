export class WorkflowSerializer {
    serialize(workflow) {
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
