import { createClient } from '@supabase/supabase-js';
import { GeminiBusinessAnalyzer } from '../../ai-factory/business-analyzer/gemini-business-analyzer.js';
import { SupabaseBusinessAnalysisRepository } from '../../ai-factory/business-analyzer/business-analysis.repository.js';
import { BusinessAnalyzerService } from '../../ai-factory/business-analyzer/business-analyzer.service.js';
export async function businessAnalyzerHandler(req, res) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ success: false, message: 'Supabase configuration is missing.' });
        }
        const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const repository = new SupabaseBusinessAnalysisRepository(supabase);
        const analyzer = new GeminiBusinessAnalyzer({ apiKey: process.env.GEMINI_API_KEY ?? '' });
        const service = new BusinessAnalyzerService(repository, analyzer);
        const result = await service.analyze(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Business analysis failed';
        return res.status(400).json({ success: false, message });
    }
}
