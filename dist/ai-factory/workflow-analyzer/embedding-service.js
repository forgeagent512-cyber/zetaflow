export class EmbeddingService {
    async generate(source) {
        const text = JSON.stringify(source).toLowerCase();
        const dimensions = 16;
        if (!text) {
            return Array.from({ length: dimensions }, () => 0);
        }
        return Array.from({ length: dimensions }, (_, index) => {
            const raw = text.charCodeAt((index * 7) % text.length) || 0;
            return Number(((raw + index * 13) % 29) / 29);
        });
    }
}
