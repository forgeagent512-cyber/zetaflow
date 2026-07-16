import { ProviderFactory } from '../services/ai-provider/provider-factory.js';
import { validateOpenRouterConfig } from '../services/ai-provider/ai-provider.config.js';
export async function aiProviderHealthHandler(req, res) {
    try {
        validateOpenRouterConfig();
        const client = ProviderFactory.create('openrouter');
        const health = await client.health();
        return res.json({ success: true, data: health });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Provider health check failed' });
    }
}
