import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { GeminiEmployeeGenerator } from '../../ai-factory/employee-generator/gemini-employee-generator.js';
import { SupabaseEmployeeRepository } from '../../ai-factory/employee-generator/employee-generator.repository.js';
import { EmployeeGeneratorService } from '../../ai-factory/employee-generator/employee-generator.service.js';

export async function employeeGeneratorHandler(req: Request, res: Response) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, message: 'Supabase configuration is missing.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const repository = new SupabaseEmployeeRepository(supabase);
    const provider = new GeminiEmployeeGenerator({ apiKey: process.env.GEMINI_API_KEY ?? '' });
    const service = new EmployeeGeneratorService(repository, provider);

    const result = await service.generate(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Employee generation failed';
    return res.status(400).json({ success: false, message });
  }
}
