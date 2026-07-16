export class EmbeddingService {
    async embed(text) {
        return Array.from({ length: 8 }, (_, index) => Number(text.length + index) % 10);
    }
}
