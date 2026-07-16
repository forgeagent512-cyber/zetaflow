export class ChunkService {
  chunk(text: string, chunkSize = 400): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    for (let index = 0; index < words.length; index += chunkSize) {
      chunks.push(words.slice(index, index + chunkSize).join(' '));
    }
    return chunks.length > 0 ? chunks : [''];
  }
}
