import { MarketplacePublisherService, MarketplaceIntelligenceService, InMemoryMarketplacePublisherRepository } from '../ai-factory/marketplace-publisher/index.js';
export async function marketplacePublishHandler(req, res) {
    try {
        const repository = new InMemoryMarketplacePublisherRepository();
        const service = new MarketplacePublisherService(repository);
        const result = await service.publish(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Marketplace publish failed';
        return res.status(400).json({ success: false, message });
    }
}
export async function marketplaceRecommendHandler(req, res) {
    try {
        const { industry, company_size, department, business_goals } = req.body;
        if (!industry || !department) {
            return res.status(400).json({ success: false, message: 'industry and department are required' });
        }
        const intelligenceService = new MarketplaceIntelligenceService();
        const availableAssets = Array.isArray(req.body.available_assets) ? req.body.available_assets : [];
        const recommendations = intelligenceService.recommend(industry, company_size ?? 'medium', department, business_goals ?? [], availableAssets);
        return res.json({ success: true, data: { recommendations } });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Marketplace recommendation failed';
        return res.status(400).json({ success: false, message });
    }
}
