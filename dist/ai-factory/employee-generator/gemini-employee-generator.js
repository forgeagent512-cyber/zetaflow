export class GeminiEmployeeGenerator {
    config;
    constructor(config) {
        this.config = config;
    }
    async generate(input) {
        if (!this.config.apiKey) {
            throw new Error('Gemini API key is required');
        }
        const prompt = [
            'You are an enterprise AI employee architect. Generate a production-ready AI employee and return ONLY valid JSON. Do NOT include markdown, code fences, or any text outside the JSON.',
            '',
            `Industry: ${input.industry}`,
            `Automation Type: ${input.automation_type}`,
            `Business Name: ${input.business_name}`,
            `Requirements: ${input.requirements.join(', ')}`,
            '',
            'REQUIRED OUTPUT FIELDS (must include ALL):',
            '',
            '1. "employee_name" (string): Unique, descriptive name for this AI employee (e.g., "Sales Dev Rep").',
            '2. "department" (string): Target department (e.g., "Sales", "Support").',
            '3. "role" (string): Specific role title.',
            '4. "description" (string): 1-2 sentence description of what this employee does.',
            '5. "system_prompt" (string): Full system prompt (3-5 sentences) defining behavior, knowledge boundaries, and escalation rules.',
            '6. "personality" (object): {"tone": string (e.g., "Professional"), "language": string (e.g., "English"), "temperature": number (0.0-1.0, default 0.4)}.',
            '7. "skills" (string[]): 3-6 skills relevant to the role.',
            '8. "goals" (string[]): 2-4 primary goals.',
            '9. "responsibilities" (string[]): 3-6 specific responsibilities.',
            '10. "limitations" (string[]): 2-4 boundaries/limitations.',
            '11. "knowledge_base" (string[]): 2-4 knowledge sources the employee should reference.',
            '12. "required_tools" (string[]): 2-4 tools needed (e.g., ["OpenAI", "Supabase"]).',
            '13. "required_integrations" (string[]): 2-4 integrations (e.g., ["CRM", "Email"]).',
            '14. "required_agents" (string[]): Names of sub-agents required.',
            '15. "required_workflows" (string[]): Workflow names this employee participates in.',
            '16. "memory" (object): {"type": "long_term" | "short_term" | "ephemeral"}.',
            '17. "recommended_models" (string[]): e.g., ["gemini-2.0-flash"].',
            '18. "openai_settings" (object | null): OpenAI-specific config if applicable, else null.',
            '19. "gemini_settings" (object | null): Gemini-specific config if applicable, else null.',
            '20. "claude_settings" (object | null): Claude-specific config if applicable, else null.',
            '21. "tools" (string[]): e.g., ["function_calling", "code_execution"].',
            '22. "function_calls" (string[]): Available function call names.',
            '23. "vector_search_settings" (object | null): Vector DB config if applicable, else null.',
            '24. "security_rules" (string[]): 2-4 security rules (e.g., ["Do not reveal secrets"]).',
            '25. "permissions" (string[]): 2-4 permission strings (e.g., ["read:customer-data"]).',
            '26. "kpis" (object[]): 2-4 KPIs each with "metric" (string), "target" (string), "measurement" (string).',
            '27. "escalation_rules" (object[]): 2-3 escalation rules each with "condition" (string), "action" (string), "escalate_to" (string).',
            '',
            'VALIDATION RULES:',
            '- All string arrays must have at least 1 item.',
            '- personality.temperature must be a number between 0.0 and 1.0.',
            '- employee_name must be non-empty and unique-sounding.',
            '- system_prompt must be at least 100 characters with clear behavioral instructions.',
            '',
            'GUARDRAILS - DO NOT:',
            '- Do NOT include any text outside the JSON object.',
            '- Do NOT wrap JSON in markdown code fences.',
            '- Do NOT add explanations, disclaimers, or notes.',
            '- Do NOT use placeholder values.',
            '- Do NOT omit any of the 27 fields listed above.',
            '',
            'EXAMPLE OUTPUT (shape only, values illustrative):',
            JSON.stringify({
                employee_name: 'Sales Dev Rep',
                department: 'Sales',
                role: 'Lead Qualification Specialist',
                description: 'Qualifies inbound leads and books meetings for the sales team.',
                system_prompt: 'You are a lead qualification specialist for ABC Corp. Your job is to engage inbound leads via chat and email, ask qualifying questions, score them, and book meetings for senior sales reps. Never make promises about pricing. Escalate angry leads to human support.',
                personality: { tone: 'Professional', language: 'English', temperature: 0.4 },
                skills: ['Lead scoring', 'CRM management', 'Email communication', 'Objection handling'],
                goals: ['Qualify 100 leads/day', 'Book 20 meetings/week', 'Maintain 80% lead quality score'],
                responsibilities: ['Respond to inbound leads within 5 min', 'Score leads using BANT framework', 'Schedule demo meetings', 'Update CRM with lead status'],
                limitations: ['Cannot modify pricing', 'Cannot close deals', 'Requires approval for custom discounts'],
                knowledge_base: ['ABC Corp product catalog', 'BANT qualification framework', 'Competitive landscape'],
                required_tools: ['OpenAI', 'Supabase', 'Zapier'],
                required_integrations: ['Salesforce CRM', 'Google Calendar', 'Gmail'],
                required_agents: ['Lead Scorer', 'Scheduler'],
                required_workflows: ['Lead Nurture', 'Demo Booking'],
                memory: { type: 'long_term' },
                recommended_models: ['gemini-2.0-flash'],
                openai_settings: null,
                gemini_settings: null,
                claude_settings: null,
                tools: ['function_calling'],
                function_calls: ['qualify_lead', 'book_meeting', 'update_crm'],
                vector_search_settings: null,
                security_rules: ['Do not reveal internal pricing', 'Escalate PII requests to compliance', 'Never share credentials'],
                permissions: ['read:leads', 'write:leads', 'read:calendar', 'write:calendar'],
                kpis: [
                    { metric: 'Leads qualified per day', target: '100', measurement: 'count' },
                    { metric: 'Meeting booking rate', target: '20/week', measurement: 'count' },
                    { metric: 'Lead quality score', target: '80%', measurement: 'percentage' }
                ],
                escalation_rules: [
                    { condition: 'Lead asks about pricing', action: 'Provide standard pricing sheet', escalate_to: 'Sales Manager' },
                    { condition: 'Lead is angry or frustrated', action: 'Apologize and transfer', escalate_to: 'Human Support' }
                ]
            }, null, 2)
        ].join('\n');
        const response = await fetch(this.config.endpoint ?? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + this.config.apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0, topP: 1, topK: 1 }
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini employee generation failed with status ${response.status}`);
        }
        const payload = await response.json();
        const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
        const parsed = JSON.parse(text);
        return {
            employee_name: parsed.employee_name ?? `${input.business_name} ${input.automation_type} Employee`,
            department: parsed.department ?? input.automation_type,
            role: parsed.role ?? 'AI Employee',
            description: parsed.description ?? `Handles ${input.automation_type.toLowerCase()} workflows for ${input.business_name}.`,
            system_prompt: parsed.system_prompt ?? `You are a professional AI employee for ${input.business_name}.`,
            personality: {
                tone: parsed.personality?.tone ?? 'Professional',
                language: parsed.personality?.language ?? 'Multi Language',
                temperature: Number(parsed.personality?.temperature ?? 0.4)
            },
            skills: Array.isArray(parsed.skills) ? parsed.skills : ['communication', 'automation'],
            goals: Array.isArray(parsed.goals) ? parsed.goals : ['Increase efficiency'],
            responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : ['Handle automated tasks'],
            limitations: Array.isArray(parsed.limitations) ? parsed.limitations : ['Requires supervision for sensitive tasks'],
            knowledge_base: Array.isArray(parsed.knowledge_base) ? parsed.knowledge_base : [`${input.industry} best practices`],
            required_tools: Array.isArray(parsed.required_tools) ? parsed.required_tools : ['OpenAI', 'Supabase'],
            required_integrations: Array.isArray(parsed.required_integrations) ? parsed.required_integrations : ['WhatsApp', 'CRM'],
            required_agents: Array.isArray(parsed.required_agents) ? parsed.required_agents : [],
            required_workflows: Array.isArray(parsed.required_workflows) ? parsed.required_workflows : [],
            memory: { type: parsed.memory?.type ?? 'long_term' },
            recommended_models: Array.isArray(parsed.recommended_models) ? parsed.recommended_models : ['gemini-2.0-flash'],
            openai_settings: parsed.openai_settings,
            gemini_settings: parsed.gemini_settings,
            claude_settings: parsed.claude_settings,
            tools: Array.isArray(parsed.tools) ? parsed.tools : ['function_calling'],
            function_calls: Array.isArray(parsed.function_calls) ? parsed.function_calls : [],
            vector_search_settings: parsed.vector_search_settings,
            security_rules: Array.isArray(parsed.security_rules) ? parsed.security_rules : ['Do not reveal secrets'],
            permissions: Array.isArray(parsed.permissions) ? parsed.permissions : ['read:customer-data', 'write:task-state'],
            kpis: Array.isArray(parsed.kpis) ? parsed.kpis : [
                { metric: 'Task completion rate', target: '90%', measurement: 'percentage' },
                { metric: 'Response time', target: '< 5 minutes', measurement: 'time' }
            ],
            escalation_rules: Array.isArray(parsed.escalation_rules) ? parsed.escalation_rules : [
                { condition: 'Unhandled error', action: 'Log and notify', escalate_to: 'System Admin' }
            ]
        };
    }
}
