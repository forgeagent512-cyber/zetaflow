export class SearchService {
    search(documents, request) {
        const query = request.query.toLowerCase();
        return documents
            .filter((document) => document.content.toLowerCase().includes(query) || document.title.toLowerCase().includes(query))
            .map((document) => ({
            id: document.title,
            title: document.title,
            content: document.content,
            score: 1
        }))
            .slice(0, request.topK ?? 5);
    }
}
