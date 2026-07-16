export class GeminiAgentGenerator {
    options;
    constructor(options) {
        this.options = options;
    }
    async generate(input) {
        if (!this.options.apiKey) {
            return this.buildFallbackResponse(input);
        }
        const prompt = [
            'You are an enterprise AI agent architect. Generate production-ready AI agent configurations and return ONLY valid JSON. Do NOT include markdown, code fences, or any text outside the JSON.',
            '',
            `Employee: ${input.employee_name}`,
            `Industry: ${input.industry}`,
            `Department: ${input.department}`,
            `Workflows: ${input.required_workflows.join(', ')}`,
            `Integrations: ${input.required_integrations.join(', ')}`,
            `Tools: ${(input.required_tools ?? ['workflow_engine', 'crm_api']).join(', ')}`,
            '',
            'REQUIRED OUTPUT STRUCTURE:',
            '{',
            '  "employee_name": string,',
            '  "agents": [',
            '    {',
            '      "agent_name": string,',
            '      "role": string,',
            '      "description": string,',
            '      "system_prompt": string,',
            '      "goals": string[],',
            '      "tools": string[],',
            '      "permissions": string[],',
            '      "memory": "long_term" | "short_term" | "ephemeral",',
            '      "llm": string (e.g., "gemini", "openai", "claude"),',
            '      "trigger_events": string[],',
            '      "required_workflows": string[],',
            '      "required_integrations": string[],',
            '      "personality": {',
            '        "tone": string,',
            '        "style": string,',
            '        "behavior_traits": string[]',
            '      },',
            '      "communication_rules": {',
            '        "sequential_execution": boolean,',
            '        "fallback_agent": string,',
            '        "retry_strategy": "exponential_backoff" | "linear" | "fixed",',
            '        "timeout_strategy": "escalate" | "retry" | "skip"',
            '      },',
            '      "error_handling": {',
            '        "strategy": "retry" | "fallback" | "escalate" | "ignore",',
            '        "max_retries": number (0-5),',
            '        "fallback_action": string',
            '      },',
            '      "retry_logic": {',
            '        "max_attempts": number (1-5),',
            '        "backoff_strategy": "exponential" | "linear" | "fixed",',
            '        "delay_ms": number (100-30000)',
            '      }',
            '    }',
            '  ]',
            '}',
            '',
            'FIELD DESCRIPTIONS:',
            '- agent_name: Unique descriptive name for the agent.',
            '- role: The agent\'s functional role within the department.',
            '- description: 1-2 sentence description of the agent\'s purpose.',
            '- system_prompt: Full behavioral prompt (3-5 sentences) defining the agent\'s persona, constraints, and coordination rules with other agents.',
            '- goals: 2-4 primary objectives this agent must achieve.',
            '- tools: Names of tools the agent can invoke (e.g., ["crm_api", "email_sender"]).',
            '- permissions: Least-privilege permission strings (e.g., ["read:leads", "write:tasks"]).',
            '- memory: Memory type for the agent.',
            '- llm: The LLM provider this agent uses.',
            '- trigger_events: Events that activate this agent (e.g., ["new_lead", "scheduled_check"]).',
            '- required_workflows: Workflows this agent participates in.',
            '- required_integrations: External systems this agent connects to.',
            '- personality: Tone, style, and behavior traits defining the agent character.',
            '- communication_rules: Protocol for inter-agent coordination.',
            '- error_handling: Error recovery configuration with strategy, max_retries, and fallback action.',
            '- retry_logic: Retry behavior with max_attempts, backoff_strategy, and delay_ms.',
            '',
            'VALIDATION RULES:',
            '- agents array must have at least 1 agent.',
            '- system_prompt must be at least 100 characters.',
            '- All string arrays must have at least 1 item.',
            '- personality.behavior_traits must have at least 1 trait.',
            '- error_handling.max_retries must be 0-5.',
            '- retry_logic.max_attempts must be 1-5.',
            '- Permissions must follow "action:resource" format.',
            '',
            'GUARDRAILS - DO NOT:',
            '- Do NOT include any text outside the JSON object.',
            '- Do NOT wrap JSON in markdown code fences.',
            '- Do NOT add explanations, disclaimers, or notes.',
            '- Do NOT invent extra fields beyond the structure above.',
            '- Do NOT use placeholder values like empty strings for required fields.',
            '',
            'EXAMPLE OUTPUT (shape only, values illustrative):',
            JSON.stringify({
                employee_name: input.employee_name,
                agents: [
                    {
                        agent_name: 'Lead Qualifier',
                        role: 'Lead Qualification',
                        description: 'Qualifies inbound leads and passes qualified ones to the booking agent.',
                        system_prompt: 'You are a lead qualification agent for ABC Corp. Evaluate inbound leads using BANT criteria. Update lead score in CRM. Pass qualified leads to the Booking Agent. Never share pricing. Escalate angry leads to a human.',
                        goals: ['Qualify leads within 5 minutes', 'Maintain 90% scoring accuracy'],
                        tools: ['crm_api', 'email_sender', 'lead_scorer'],
                        permissions: ['read:leads', 'write:leads', 'read:contacts'],
                        memory: 'long_term',
                        llm: 'gemini',
                        trigger_events: ['new_lead', 'lead_reassigned'],
                        required_workflows: input.required_workflows,
                        required_integrations: input.required_integrations,
                        personality: {
                            tone: 'professional',
                            style: 'direct',
                            behavior_traits: ['proactive', 'courteous', 'detail-oriented']
                        },
                        communication_rules: {
                            sequential_execution: true,
                            fallback_agent: 'Operations',
                            retry_strategy: 'exponential_backoff',
                            timeout_strategy: 'escalate'
                        },
                        error_handling: {
                            strategy: 'retry',
                            max_retries: 3,
                            fallback_action: 'escalate'
                        },
                        retry_logic: {
                            max_attempts: 3,
                            backoff_strategy: 'exponential',
                            delay_ms: 1000
                        }
                    }
                ]
            }, null, 2)
        ].join('\n');
        const response = await fetch(this.options.endpoint ?? `https://generativelanguage.googleapis.com/v1beta/models/${this.options.model ?? 'gemini-2.0-flash'}:generateContent?key=${this.options.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0, topP: 1, topK: 1 }
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini agent generation failed with status ${response.status}`);
        }
        const payload = await response.json();
        const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
        const parsed = this.parseJsonResponse(text);
        const employeeName = typeof parsed.employee_name === 'string' && parsed.employee_name.trim() ? parsed.employee_name : input.employee_name;
        return {
            employee_name: employeeName,
            agents: Array.isArray(parsed.agents) ? parsed.agents.map((agent) => ({
                agent_name: typeof agent.agent_name === 'string' ? agent.agent_name : `${input.department} Agent`,
                role: typeof agent.role === 'string' ? agent.role : input.department,
                description: typeof agent.description === 'string' ? agent.description : `Primary agent for ${input.employee_name}`,
                system_prompt: typeof agent.system_prompt === 'string' ? agent.system_prompt : `You support ${input.employee_name} in ${input.industry}.`,
                goals: Array.isArray(agent.goals) ? agent.goals.filter((goal) => typeof goal === 'string') : ['Execute assigned workflow tasks'],
                tools: Array.isArray(agent.tools) ? agent.tools.filter((tool) => typeof tool === 'string') : (input.required_tools ?? ['workflow_engine', 'crm_api']),
                permissions: Array.isArray(agent.permissions) ? agent.permissions.filter((permission) => typeof permission === 'string') : ['read:customer-data', 'write:task-state'],
                memory: typeof agent.memory === 'string' ? agent.memory : 'short_term',
                llm: typeof agent.llm === 'string' ? agent.llm : 'gemini',
                trigger_events: Array.isArray(agent.trigger_events) ? agent.trigger_events.filter((event) => typeof event === 'string') : ['new_request'],
                required_workflows: Array.isArray(agent.required_workflows) ? agent.required_workflows.filter((workflow) => typeof workflow === 'string') : input.required_workflows,
                required_integrations: Array.isArray(agent.required_integrations) ? agent.required_integrations.filter((integration) => typeof integration === 'string') : input.required_integrations,
                personality: agent.personality && typeof agent.personality === 'object' ? agent.personality : {
                    tone: 'professional',
                    style: 'direct',
                    behavior_traits: ['proactive', 'courteous', 'detail-oriented']
                },
                communication_rules: agent.communication_rules && typeof agent.communication_rules === 'object' ? agent.communication_rules : {
                    sequential_execution: true,
                    fallback_agent: 'operations',
                    retry_strategy: 'exponential_backoff',
                    timeout_strategy: 'escalate'
                },
                error_handling: agent.error_handling && typeof agent.error_handling === 'object' ? agent.error_handling : {
                    strategy: 'retry',
                    max_retries: 3,
                    fallback_action: 'escalate'
                },
                retry_logic: agent.retry_logic && typeof agent.retry_logic === 'object' ? agent.retry_logic : {
                    max_attempts: 3,
                    backoff_strategy: 'exponential',
                    delay_ms: 1000
                }
            })) : this.buildFallbackResponse(input).agents
        };
    }
    buildFallbackResponse(input) {
        return {
            employee_name: input.employee_name,
            agents: [
                {
                    agent_name: `${input.department} Agent`,
                    role: input.department,
                    description: `Primary agent for ${input.employee_name}`,
                    system_prompt: `You support ${input.employee_name} in ${input.industry}.`,
                    goals: ['Execute assigned workflow tasks'],
                    tools: input.required_tools ?? ['workflow_engine', 'crm_api'],
                    permissions: ['read:customer-data', 'write:task-state'],
                    memory: 'short_term',
                    llm: 'gemini',
                    trigger_events: ['new_request'],
                    required_workflows: input.required_workflows,
                    required_integrations: input.required_integrations,
                    personality: {
                        tone: 'professional',
                        style: 'direct',
                        behavior_traits: ['proactive', 'courteous', 'detail-oriented']
                    },
                    communication_rules: {
                        sequential_execution: true,
                        fallback_agent: 'operations',
                        retry_strategy: 'exponential_backoff',
                        timeout_strategy: 'escalate'
                    },
                    error_handling: {
                        strategy: 'retry',
                        max_retries: 3,
                        fallback_action: 'escalate'
                    },
                    retry_logic: {
                        max_attempts: 3,
                        backoff_strategy: 'exponential',
                        delay_ms: 1000
                    }
                }
            ]
        };
    }
    parseJsonResponse(text) {
        const trimmed = text.trim();
        const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        const payload = fenced?.[1] ?? trimmed;
        return JSON.parse(payload);
    }
}
