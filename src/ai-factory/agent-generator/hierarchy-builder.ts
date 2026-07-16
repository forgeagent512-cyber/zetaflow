import type { AgentDefinitionDto } from './agent-generator.dto.js';

export class HierarchyBuilder {
  build(agents: AgentDefinitionDto[]): Array<{ agent_name: string; parent?: string }> {
    return agents.map((agent, index) => ({
      agent_name: agent.agent_name,
      parent: index === 0 ? undefined : agents[index - 1].agent_name
    }));
  }
}
