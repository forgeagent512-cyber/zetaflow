export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class ConversationMemory {
  private conversations = new Map<string, ConversationMessage[]>();

  addMessage(conversationId: string, message: ConversationMessage): void {
    const history = this.conversations.get(conversationId) ?? [];
    history.push(message);
    this.conversations.set(conversationId, history);
  }

  getHistory(conversationId: string, limit?: number): ConversationMessage[] {
    const history = this.conversations.get(conversationId) ?? [];
    if (limit && limit > 0) {
      return history.slice(-limit);
    }
    return [...history];
  }

  clear(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  summarize(conversationId: string, maxTokens = 500): string {
    const history = this.conversations.get(conversationId);
    if (!history || history.length === 0) return '';

    let summary = '';
    for (const msg of history) {
      const line = `[${msg.role}] ${msg.content}\n`;
      if ((summary.length + line.length) / 4 > maxTokens) break;
      summary += line;
    }
    return summary.trim();
  }
}
