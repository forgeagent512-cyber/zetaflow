export interface CommunicationPlan {
  topology: 'sequential' | 'parallel' | 'hybrid';
  rules: Array<{
    from: string;
    to: string;
    type: string;
    fallbackAgent?: string;
  }>;
}

export class CommunicationPlanner {
  plan(agents: Array<{ agent_name: string }>): CommunicationPlan {
    const rules = agents.slice(0, -1).map((agent, index) => ({
      from: agent.agent_name,
      to: agents[index + 1].agent_name,
      type: 'handoff'
    }));

    return {
      topology: agents.length > 2 ? 'hybrid' : 'sequential',
      rules
    };
  }
}
