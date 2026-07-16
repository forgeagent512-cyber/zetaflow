export class HierarchyBuilder {
    build(agents) {
        return agents.map((agent, index) => ({
            agent_name: agent.agent_name,
            parent: index === 0 ? undefined : agents[index - 1].agent_name
        }));
    }
}
