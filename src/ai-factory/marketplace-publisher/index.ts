import type { AiFactoryRequest, AiFactoryResponse, Auditable } from '../shared/contracts.js';
import type { Repository } from '../shared/repositories.js';
import { InMemoryRepository } from '../shared/repositories.js';
import { randomUUID } from 'node:crypto';

export interface MarketplaceListingModel extends Auditable {
  assetId: string;
  marketplace: string;
  status: 'draft' | 'submitted' | 'published' | 'failed';
  listingUrl?: string;
}

export interface MarketplacePublishRequestDto extends AiFactoryRequest {
  assetId: string;
  marketplace: string;
  assetType: 'template' | 'employee' | 'agent' | 'workflow';
  assetName: string;
  description: string;
  category?: string;
  industry?: string;
  tags?: string[];
  price?: number;
}

export interface MarketplacePublishResultDto extends AiFactoryResponse {
  listing: MarketplaceListingModel;
}

export interface MarketplacePublisherRepository extends Repository<MarketplaceListingModel> {
  findByAssetId(assetId: string): Promise<MarketplaceListingModel[]>;
}

export class InMemoryMarketplacePublisherRepository extends InMemoryRepository<MarketplaceListingModel> implements MarketplacePublisherRepository {
  async findByAssetId(assetId: string): Promise<MarketplaceListingModel[]> {
    return [];
  }
}

export interface IAssetMarketplacePublisher {
  publishToSupabase(request: MarketplacePublishRequestDto): Promise<MarketplaceListingModel>;
  publishToN8n(request: MarketplacePublishRequestDto): Promise<MarketplaceListingModel>;
}

export interface IMarketplacePublisherService {
  publish(request: MarketplacePublishRequestDto): Promise<MarketplacePublishResultDto>;
  publishToSupabase(request: MarketplacePublishRequestDto): Promise<MarketplaceListingModel>;
  publishToN8n(request: MarketplacePublishRequestDto): Promise<MarketplaceListingModel>;
}

export class MarketplacePublisherService implements IMarketplacePublisherService {
  constructor(private readonly repository: MarketplacePublisherRepository) {}

  async publish(request: MarketplacePublishRequestDto): Promise<MarketplacePublishResultDto> {
    const now = new Date().toISOString();

    const listing: MarketplaceListingModel = {
      id: randomUUID(),
      organizationId: request.organizationId,
      assetId: request.assetId,
      marketplace: request.marketplace,
      status: 'published',
      listingUrl: this.generateListingUrl(request),
      createdAt: now,
      updatedAt: now,
      createdBy: request.requestedBy,
    };

    await this.repository.save(listing);

    return {
      id: randomUUID(),
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      listing,
    };
  }

  async publishToSupabase(request: MarketplacePublishRequestDto): Promise<MarketplaceListingModel> {
    const now = new Date().toISOString();
    const listing: MarketplaceListingModel = {
      id: randomUUID(),
      organizationId: request.organizationId,
      assetId: request.assetId,
      marketplace: 'supabase_marketplace',
      status: 'published',
      listingUrl: this.generateSupabaseUrl(request),
      createdAt: now,
      updatedAt: now,
      createdBy: request.requestedBy,
    };

    await this.repository.save(listing);
    return listing;
  }

  async publishToN8n(request: MarketplacePublishRequestDto): Promise<MarketplaceListingModel> {
    const now = new Date().toISOString();
    const listing: MarketplaceListingModel = {
      id: randomUUID(),
      organizationId: request.organizationId,
      assetId: request.assetId,
      marketplace: 'n8n_workflows',
      status: 'published',
      listingUrl: this.generateN8nUrl(request),
      createdAt: now,
      updatedAt: now,
      createdBy: request.requestedBy,
    };

    await this.repository.save(listing);
    return listing;
  }

  private generateListingUrl(request: MarketplacePublishRequestDto): string {
    const baseUrl = process.env.MARKETPLACE_BASE_URL ?? 'https://marketplace.ai-real-estate.app';
    return `${baseUrl}/${request.marketplace}/${request.assetType}/${request.assetId}`;
  }

  private generateSupabaseUrl(request: MarketplacePublishRequestDto): string {
    const baseUrl = process.env.SUPABASE_URL ?? 'https://supabase.ai-real-estate.app';
    return `${baseUrl}/marketplace/${request.assetType}/${request.assetId}`;
  }

  private generateN8nUrl(request: MarketplacePublishRequestDto): string {
    const baseUrl = process.env.N8N_BASE_URL ?? 'https://n8n.ai-real-estate.app';
    return `${baseUrl}/workflow/${request.assetId}`;
  }
}

export interface MarketplaceRecommendation {
  assetId: string;
  assetType: 'template' | 'employee' | 'agent' | 'workflow';
  name: string;
  description: string;
  category: string;
  industry: string;
  relevanceScore: number;
  matchReasons: string[];
}

export class MarketplaceIntelligenceService {
  recommend(
    industry: string,
    companySize: 'small' | 'medium' | 'enterprise',
    department: string,
    businessGoals: string[],
    availableTemplates: MarketplacePublishRequestDto[]
  ): MarketplaceRecommendation[] {
    const scored = availableTemplates
      .filter(t => t.industry === industry || t.industry === 'General')
      .map(t => {
        let score = 0;
        const reasons: string[] = [];

        if (t.industry === industry) {
          score += 30;
          reasons.push(`Industry match: ${industry}`);
        }

        if (t.category?.toLowerCase() === department.toLowerCase()) {
          score += 25;
          reasons.push(`Department match: ${department}`);
        }

        const goalMatches = businessGoals.filter(g =>
          t.description.toLowerCase().includes(g.toLowerCase()) ||
          t.tags?.some(tag => tag.toLowerCase().includes(g.toLowerCase()))
        );
        if (goalMatches.length > 0) {
          score += goalMatches.length * 10;
          reasons.push(`Goal match: ${goalMatches.join(', ')}`);
        }

        if (companySize === 'small' && t.tags?.includes('quick-setup')) score += 10;
        if (companySize === 'enterprise' && t.tags?.includes('enterprise')) score += 10;

        return {
          assetId: t.assetId,
          assetType: t.assetType,
          name: t.assetName,
          description: t.description,
          category: t.category ?? 'General',
          industry: t.industry ?? 'General',
          relevanceScore: Math.min(100, score),
          matchReasons: reasons,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scored.slice(0, 10);
  }
}
