import type { BusinessAnalyzerRequestDto } from './business-analysis.dto.js';
import type { BusinessAnalyzerAnalysisDto } from './business-analysis.dto.js';

export interface GeminiBusinessAnalyzerConfig {
  apiKey: string;
  model?: string;
  endpoint?: string;
}

export class GeminiBusinessAnalyzer {
  constructor(private readonly config: GeminiBusinessAnalyzerConfig) {}

  async generateAnalysis(request: BusinessAnalyzerRequestDto): Promise<BusinessAnalyzerAnalysisDto> {
    return this.analyze(request);
  }

  async analyze(request: BusinessAnalyzerRequestDto): Promise<BusinessAnalyzerAnalysisDto> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    const prompt = [
      'You are an enterprise AI automation architect. Analyze the following business and return ONLY valid JSON. Do NOT include markdown, code fences, or any text outside the JSON.',
      '',
      'REQUIRED OUTPUT FIELDS (must include ALL):',
      '',
      '1. "company_summary" (string): Concise 2-3 sentence summary of the company and its operations.',
      '2. "industry" (string): The primary industry classification.',
      '3. "department_analysis" (array): Each item is an object with:',
      '   - "name" (string): Department name',
      '   - "pain_points" (string[]): 2-4 pain points specific to this department',
      '   - "automation_opportunities" (string[]): 2-4 automation opportunities for this department',
      '4. "pain_points" (string[]): 3-5 top cross-organizational pain points.',
      '5. "automation_opportunities" (string[]): 3-5 key automation areas.',
      '6. "ai_opportunities" (string[]): 3-5 specific AI-driven opportunities (e.g., "Predictive lead scoring using ML").',
      '7. "suggested_employees" (array): Each: {"name": string, "role": string, "department": string}. 2-4 items.',
      '8. "suggested_agents" (array): Each: {"name": string, "goal": string}. 2-4 items.',
      '9. "suggested_workflows" (array): Each: {"name": string, "description": string, "category": string}. 2-4 items.',
      '10. "suggested_integrations" (array): Each: {"name": string, "provider": string}. 2-4 items.',
      '11. "kpis" (array): Each: {"metric": string, "target": string, "measurement": string}. 3-5 items.',
      '12. "roi_estimate" (object): {"upfront_cost": number, "monthly_savings": number, "payback_months": number, "three_year_roi": number}. All numbers must be realistic positive values.',
      '13. "business_type" (string): e.g., "B2B", "B2C", "Hybrid", "Enterprise".',
      '14. "automation_type" (string): e.g., "Sales", "Support", "Marketing", "Operations".',
      '15. "recommended_ai_employees" (string[]): Names of recommended AI employees.',
      '16. "recommended_agents" (string[]): Names of recommended agents.',
      '17. "recommended_workflows" (string[]): Names of recommended workflows.',
      '18. "required_integrations" (string[]): e.g., ["CRM", "Email", "Calendar"].',
      '19. "required_tools" (string[]): e.g., ["OpenAI", "Supabase", "Zapier"].',
      '20. "required_database_tables" (string[]): e.g., ["leads", "tasks", "contacts"].',
      '21. "complexity" (string): Must be exactly "low", "medium", or "high".',
      '22. "estimated_build_time" (number): Total build time in hours (integer, 8-500).',
      '23. "estimated_cost" (number): Total estimated cost in USD (integer).',
      '24. "confidence" (number): Confidence score between 0.0 and 1.0.',
      '',
      'VALIDATION RULES:',
      '- Every field listed above must be present in the output.',
      '- All string arrays must have at least 1 item unless otherwise noted.',
      '- All number fields must be valid numbers (not strings or null).',
      '- complexity must be exactly one of: "low", "medium", "high".',
      '- roi_estimate.three_year_roi must be a multiplier (e.g., 3.5 means 350% ROI over 3 years).',
      '- confidence must be between 0 and 1 (inclusive).',
      '',
      'GUARDRAILS - DO NOT:',
      '- Do NOT include any text outside the JSON object.',
      '- Do NOT wrap the JSON in markdown code fences (```json ... ```).',
      '- Do NOT add explanations, disclaimers, or notes.',
      '- Do NOT invent fields not listed above.',
      '- Do NOT use placeholder values like "string" or "number" as actual values.',
      '',
      'EXAMPLE OUTPUT (shape only, values are illustrative):',
      JSON.stringify({
        company_summary: 'ABC Corp is a mid-market SaaS provider specializing in HR tools for SMBs.',
        industry: 'SaaS / HR Technology',
        department_analysis: [
          { name: 'Sales', pain_points: ['Low lead conversion', 'Manual follow-ups'], automation_opportunities: ['AI lead scoring', 'Auto-email sequences'] }
        ],
        pain_points: ['Manual data entry across systems', 'Slow response to leads'],
        automation_opportunities: ['End-to-end sales automation', 'Automated reporting'],
        ai_opportunities: ['Predictive lead scoring', 'Smart reply suggestions'],
        suggested_employees: [{ name: 'Sales Dev Rep', role: 'Lead Qualification', department: 'Sales' }],
        suggested_agents: [{ name: 'Lead Qualifier', goal: 'Qualify inbound leads automatically' }],
        suggested_workflows: [{ name: 'Lead Nurture', description: 'Automated lead nurturing sequence', category: 'Sales' }],
        suggested_integrations: [{ name: 'Salesforce', provider: 'Salesforce' }],
        kpis: [{ metric: 'Lead Response Time', target: '< 5 min', measurement: 'Average response time in minutes' }],
        roi_estimate: { upfront_cost: 15000, monthly_savings: 5000, payback_months: 3, three_year_roi: 12 },
        business_type: 'B2B SaaS',
        automation_type: 'Sales',
        recommended_ai_employees: ['Sales Dev Rep'],
        recommended_agents: ['Lead Qualifier'],
        recommended_workflows: ['Lead Nurture'],
        required_integrations: ['CRM'],
        required_tools: ['OpenAI', 'Supabase'],
        required_database_tables: ['leads', 'contacts'],
        complexity: 'medium',
        estimated_build_time: 120,
        estimated_cost: 15000,
        confidence: 0.92
      }, null, 2),
      '',
      'BUSINESS INPUT:',
      JSON.stringify(request, null, 2)
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
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    const cleanJson = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      company_summary: parsed.company_summary ?? '',
      industry: parsed.industry ?? request.industry,
      department_analysis: Array.isArray(parsed.department_analysis) ? parsed.department_analysis : [],
      pain_points: Array.isArray(parsed.pain_points) ? parsed.pain_points : [],
      automation_opportunities: Array.isArray(parsed.automation_opportunities) ? parsed.automation_opportunities : [],
      ai_opportunities: Array.isArray(parsed.ai_opportunities) ? parsed.ai_opportunities : [],
      suggested_employees: Array.isArray(parsed.suggested_employees) ? parsed.suggested_employees : [],
      suggested_agents: Array.isArray(parsed.suggested_agents) ? parsed.suggested_agents : [],
      suggested_workflows: Array.isArray(parsed.suggested_workflows) ? parsed.suggested_workflows : [],
      suggested_integrations: Array.isArray(parsed.suggested_integrations) ? parsed.suggested_integrations : [],
      kpis: Array.isArray(parsed.kpis) ? parsed.kpis : [],
      roi_estimate: parsed.roi_estimate && typeof parsed.roi_estimate === 'object'
        ? {
            upfront_cost: Number(parsed.roi_estimate.upfront_cost ?? 0),
            monthly_savings: Number(parsed.roi_estimate.monthly_savings ?? 0),
            payback_months: Number(parsed.roi_estimate.payback_months ?? 0),
            three_year_roi: Number(parsed.roi_estimate.three_year_roi ?? 0)
          }
        : { upfront_cost: 0, monthly_savings: 0, payback_months: 0, three_year_roi: 0 },
      business_type: parsed.business_type ?? request.industry,
      automation_type: parsed.automation_type ?? 'Customer Support',
      recommended_ai_employees: Array.isArray(parsed.recommended_ai_employees) ? parsed.recommended_ai_employees : [],
      recommended_agents: Array.isArray(parsed.recommended_agents) ? parsed.recommended_agents : [],
      recommended_workflows: Array.isArray(parsed.recommended_workflows) ? parsed.recommended_workflows : [],
      required_integrations: Array.isArray(parsed.required_integrations) ? parsed.required_integrations : [],
      required_tools: Array.isArray(parsed.required_tools) ? parsed.required_tools : [],
      required_database_tables: Array.isArray(parsed.required_database_tables) ? parsed.required_database_tables : [],
      complexity: parsed.complexity ?? 'medium',
      estimated_build_time: Number(parsed.estimated_build_time ?? 120),
      estimated_cost: Number(parsed.estimated_cost ?? 299),
      confidence: Number(parsed.confidence ?? 0.9)
    };
  }
}
