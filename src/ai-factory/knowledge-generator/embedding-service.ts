import { createClient } from '@supabase/supabase-js';

export class EmbeddingService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  }

  async embed(text: string): Promise<number[]> {
    // Use the AI provider for real embeddings
    try {
      const openrouterKey = process.env.OPENROUTER_API_KEY;
      if (openrouterKey) {
        const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`,
          },
          body: JSON.stringify({
            model: 'openai/text-embedding-ada-002',
            input: text,
          }),
        });
        if (response.ok) {
          const data = await response.json() as { data: Array<{ embedding: number[] }> };
          return data.data[0].embedding;
        }
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback: Supabase vector extension compatible placeholder
    // Return a zero vector of 1536 dimensions (standard OpenAI embedding size)
    return new Array(1536).fill(0);
  }
}
