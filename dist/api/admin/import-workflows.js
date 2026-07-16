import { createClient } from '@supabase/supabase-js';
import { createWorkflowImportService } from '../../services/automation-import/workflow-import.service.js';
export async function importWorkflowsHandler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ success: false, message: 'Supabase configuration missing.' });
    }
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
    });
    const service = await createWorkflowImportService(supabase);
    const summary = await service.importAll();
    return res.json({ success: true, ...summary });
}
