import { createClient } from '@supabase/supabase-js';
import { AgentGeneratorService } from '../../ai-factory/agent-generator/agent-generator.service.js';
import { SupabaseAgentRepository } from '../../ai-factory/agent-generator/agent-generator.repository.js';
import { GeminiAgentGenerator } from '../../ai-factory/agent-generator/gemini-agent-generator.js';
export async function agentGeneratorHandler(req, res) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ success: false, message: 'Supabase configuration is missing.' });
        }
        const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const repository = new SupabaseAgentRepository(supabase);
        const provider = new GeminiAgentGenerator({ apiKey: process.env.GEMINI_API_KEY ?? '' });
        const service = new AgentGeneratorService(repository, provider);
        const result = await service.generate(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Agent generation failed';
        return res.status(400).json({ success: false, message });
    }
}
