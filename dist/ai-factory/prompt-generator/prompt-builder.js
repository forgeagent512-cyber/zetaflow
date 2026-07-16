export class PromptBuilder {
    build(input, model) {
        const employeeName = this.stringValue(input.employee, 'employee_name') ?? this.stringValue(input.employee, 'name') ?? 'AI Employee';
        const agentName = this.stringValue(input.agent, 'agent_name') ?? this.stringValue(input.agent, 'name') ?? 'AI Agent';
        const role = this.stringValue(input.agent, 'role') ?? this.stringValue(input.employee, 'role') ?? 'Operations';
        const promptType = input.promptType ?? 'Custom';
        const tone = input.tone ?? 'professional';
        const language = input.language ?? 'English';
        const requirements = input.requirements ?? [];
        const context = input.context ?? {};
        const systemPrompt = [
            `You are ${employeeName}, a ${role} specialist for ${input.organizationId}.`,
            `You operate in ${language} with a ${tone} tone.`,
            `Your purpose is to execute business workflows for ${promptType} use cases.`,
            `Use the following requirements as non-negotiable business constraints: ${requirements.join(', ') || 'none'}.`,
            `When context is present, prioritize it: ${JSON.stringify(context)}.`
        ].join(' ');
        const developerPrompt = [
            `Model optimization: ${model}.`,
            'Follow a structured response format.',
            'Use clear business reasoning, concise actions, and precise escalation paths.',
            'Prefer verifiable facts over assumptions.',
            'When a task is ambiguous, ask a clarifying question before acting.'
        ].join(' ');
        const assistantPrompt = [
            `Start by acknowledging the task and restating the requested outcome.`,
            `Then provide the next action with clear details for ${agentName}.`,
            `If the request requires a tool or integration, mention it explicitly.`,
            `If the request is sensitive, escalate according to policy.`
        ].join(' ');
        const promptJson = {
            role,
            model,
            tone,
            language,
            prompt_type: promptType,
            employee_name: employeeName,
            agent_name: agentName,
            requirements,
            conversation_rules: [
                'Be concise and business-focused.',
                'Never fabricate facts.',
                'Use evidence-backed reasoning.'
            ],
            guard_rails: [
                'Do not reveal secrets.',
                'Do not bypass business policy.',
                'Escalate high-risk requests.'
            ],
            memory_strategy: 'long_term',
            response_templates: ['summary', 'action_plan', 'handoff']
        };
        return {
            prompt_name: `${promptType} ${agentName} Prompt`,
            prompt_type: promptType,
            system_prompt: systemPrompt,
            developer_prompt: developerPrompt,
            assistant_prompt: assistantPrompt,
            prompt_json: promptJson,
            version: '1.0',
            status: 'active'
        };
    }
    stringValue(source, key) {
        const value = source?.[key];
        return typeof value === 'string' && value.trim() ? value : undefined;
    }
}
