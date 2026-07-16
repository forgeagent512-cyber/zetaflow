export class PromptBuilder {
    build(input) {
        return [
            `You are an enterprise AI employee architect for ${input.business_name}.`,
            `Industry: ${input.industry}.`,
            `Automation type: ${input.automation_type}.`,
            `Business context: ${input.business_name} requires automation solutions for ${input.automation_type} workflows.`,
            'Generate a production-ready employee JSON object ONLY. No markdown, no code fences, no explanations.',
            '',
            'REQUIRED FIELDS (all must be present):',
            '- employee_name (string): Unique descriptive name.',
            '- department (string): Target department name.',
            '- role (string): Specific role title (e.g., "Lead Qualification Specialist").',
            '- description (string): 1-2 sentence summary of responsibilities.',
            '- system_prompt (string): Full behavioral prompt (min 100 chars) defining personality, constraints, and escalation paths.',
            '- personality (object): {tone: string, language: string, temperature: number (0.0-1.0)}.',
            '- skills (string[]): 3-6 relevant skills.',
            '- goals (string[]): 2-4 measurable goals.',
            '- responsibilities (string[]): 3-6 specific duties.',
            '- limitations (string[]): 2-4 boundaries the employee must respect.',
            '- knowledge_base (string[]): 2-4 knowledge domains or references.',
            '- required_tools (string[]): Tool names needed for operation.',
            '- required_integrations (string[]): External system names.',
            '- required_agents (string[]): Sub-agents this employee needs.',
            '- required_workflows (string[]): Workflows this employee participates in.',
            '- memory (object): {type: "long_term" | "short_term" | "ephemeral"}.',
            '- recommended_models (string[]): Preferred AI models.',
            '- openai_settings (object|null): Optional OpenAI config.',
            '- gemini_settings (object|null): Optional Gemini config.',
            '- claude_settings (object|null): Optional Claude config.',
            '- tools (string[]): Available tool capabilities (e.g., ["function_calling"]).',
            '- function_calls (string[]): Available function names.',
            '- vector_search_settings (object|null): Optional vector search config.',
            '- security_rules (string[]): 2-4 security constraints.',
            '- permissions (string[]): 2-4 permission strings in "action:resource" format.',
            '- kpis (object[]): 2-4 KPIs with {metric: string, target: string, measurement: string}.',
            '- escalation_rules (object[]): 2-3 escalation rules with {condition: string, action: string, escalate_to: string}.',
            '',
            'VALIDATION: All fields required. Arrays min 1 item. temperature 0.0-1.0. system_prompt min 100 chars. permissions must use "action:resource" format.',
            '',
            'GUARDRAILS: Only output JSON. No markdown fences. No extra text. No placeholder values. Do not omit any field.',
            '',
            `Requirements: ${input.requirements.join(', ')}.`
        ].join('\n');
    }
}
export class KnowledgeBuilder {
    build(input) {
        return [
            `${input.industry} domain knowledge`,
            `${input.automation_type} operations`,
            ...input.requirements
        ];
    }
}
export class EmployeeSerializer {
    serialize(employee) {
        return { ...employee };
    }
}
