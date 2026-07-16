export class ConversationMemory {
    conversations = new Map();
    addMessage(conversationId, message) {
        const history = this.conversations.get(conversationId) ?? [];
        history.push(message);
        this.conversations.set(conversationId, history);
    }
    getHistory(conversationId, limit) {
        const history = this.conversations.get(conversationId) ?? [];
        if (limit && limit > 0) {
            return history.slice(-limit);
        }
        return [...history];
    }
    clear(conversationId) {
        this.conversations.delete(conversationId);
    }
    summarize(conversationId, maxTokens = 500) {
        const history = this.conversations.get(conversationId);
        if (!history || history.length === 0)
            return '';
        let summary = '';
        for (const msg of history) {
            const line = `[${msg.role}] ${msg.content}\n`;
            if ((summary.length + line.length) / 4 > maxTokens)
                break;
            summary += line;
        }
        return summary.trim();
    }
}
