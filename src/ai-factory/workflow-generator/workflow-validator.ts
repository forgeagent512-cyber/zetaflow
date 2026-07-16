export class WorkflowValidator {
  validate(workflow: Record<string, unknown>): void {
    const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
    const connections = workflow.connections && typeof workflow.connections === 'object' ? workflow.connections as Record<string, unknown> : {};

    if (nodes.length === 0) {
      throw new Error('Workflow must contain at least one node');
    }

    const ids = new Set<string>();
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const record = node as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : null;
      if (!id) continue;
      if (ids.has(id)) {
        throw new Error(`Duplicate node ID detected: ${id}`);
      }
      ids.add(id);
    }

    const hasTrigger = nodes.some((node) => {
      if (!node || typeof node !== 'object') return false;
      const record = node as Record<string, unknown>;
      return typeof record.type === 'string' && (record.type.includes('trigger') || record.type.includes('webhook'));
    });

    if (!hasTrigger) {
      throw new Error('Workflow must include a trigger node');
    }

    for (const [source, links] of Object.entries(connections)) {
      if (!Array.isArray(links)) continue;
      for (const link of links) {
        if (!Array.isArray(link)) continue;
        for (const edge of link) {
          if (!edge || typeof edge !== 'object') continue;
          const target = (edge as Record<string, unknown>).to;
          if (typeof target !== 'string') {
            throw new Error('Invalid connection target');
          }
        }
      }
    }
  }
}
