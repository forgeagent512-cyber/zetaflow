import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createWorkflowImportService } from '../services/automation-import/workflow-import.service.js';
async function main() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
        process.exitCode = 1;
        return;
    }
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
    });
    const service = await createWorkflowImportService(supabase);
    const summary = await service.importAll();
    console.log(JSON.stringify({ success: true, ...summary }, null, 2));
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
