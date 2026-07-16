import type { Request, Response } from 'express';
import { createSupabaseClient } from '../services/supabase/supabase-client.js';

export async function supabaseHealthHandler(req: Request, res: Response) {
  try {
    const client = createSupabaseClient();
    const { data, error } = await client.from('organizations').select('id').limit(1);
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, data: { status: 'ok', sample: data ?? [] } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Supabase health check failed' });
  }
}
