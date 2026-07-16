import { N8nClient } from './n8n-client.js';
export class CredentialSyncService {
    client;
    constructor(client = new N8nClient()) {
        this.client = client;
    }
    async syncCredentials(payload) {
        return this.client.syncCredentials(payload);
    }
}
