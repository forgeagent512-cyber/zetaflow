export interface SemanticSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export class SemanticSearchService {
  constructor(private readonly embeddingService: { embed(text: string): Promise<number[]> }) {}

  async search(
    query: string,
    index: Array<{ id: string; content: string; embedding: number[]; metadata: Record<string, unknown> }>,
    topK = 5
  ): Promise<SemanticSearchResult[]> {
    const queryEmbedding = await this.embeddingService.embed(query);
    const scored = index.map((entry) => ({
      id: entry.id,
      content: entry.content,
      score: this.cosineSimilarity(queryEmbedding, entry.embedding),
      metadata: entry.metadata
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }
}
