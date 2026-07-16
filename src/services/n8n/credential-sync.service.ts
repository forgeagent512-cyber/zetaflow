import { N8nClient } from './n8n-client.js';
import type { N8nCredentialPayload } from './n8n.types.js';

export class CredentialSyncService {
  constructor(private readonly client: N8nClient = new N8nClient()) {}

  async syncCredentials(payload: N8nCredentialPayload): Promise<{ success: boolean }> {
    return this.client.syncCredentials(payload);
  }
}
