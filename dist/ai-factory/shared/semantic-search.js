export class SemanticSearchService {
    embeddingService;
    constructor(embeddingService) {
        this.embeddingService = embeddingService;
    }
    async search(query, index, topK = 5) {
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
    cosineSimilarity(a, b) {
        const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        if (normA === 0 || normB === 0)
            return 0;
        return dot / (normA * normB);
    }
}
