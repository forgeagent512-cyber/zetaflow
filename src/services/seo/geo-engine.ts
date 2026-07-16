import type { GEOEntity } from './seo.types.js';
import { ProviderFactory } from '../ai-provider/provider-factory.js';
import { createClient } from '@supabase/supabase-js';

export class GEOEngine {
  private ai = ProviderFactory.create('openrouter');

  private getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
  }

  async createEntity(data: GEOEntity): Promise<GEOEntity> {
    const supabase = this.getSupabase();
    const { data: entity, error } = await supabase
      .from('geo_entities')
      .insert({
        organization_id: data.organizationId,
        name: data.name,
        entity_type: data.entityType,
        description: data.description,
        attributes: data.attributes ?? {},
        relationships: data.relationships ?? {},
        context: data.context ?? '',
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create entity: ${error.message}`);
    return {
      id: entity.id,
      organizationId: entity.organization_id,
      name: entity.name,
      entityType: entity.entity_type,
      description: entity.description,
      attributes: entity.attributes,
      relationships: entity.relationships,
      context: entity.context,
    };
  }

  async buildKnowledgeGraph(orgId: string, entities: GEOEntity[]): Promise<any> {
    const supabase = this.getSupabase();
    const existing = await supabase
      .from('geo_entities')
      .select('*')
      .eq('organization_id', orgId);
    const allEntities = [...(existing.data ?? []), ...entities.map(e => ({
      organization_id: e.organizationId,
      name: e.name,
      entity_type: e.entityType,
      description: e.description,
      attributes: e.attributes ?? {},
      relationships: e.relationships ?? {},
      context: e.context ?? '',
    }))];
    const uniqueMap = new Map<string, any>();
    allEntities.forEach(e => uniqueMap.set(e.name, e));
    const unique = Array.from(uniqueMap.values());
    const nodes = unique.map((e, i) => ({
      id: `entity-${i}`,
      name: e.name,
      type: e.entity_type,
      description: e.description,
    }));
    const edges: Array<{ source: string; target: string; relation: string }> = [];
    unique.forEach((e) => {
      if (e.relationships) {
        Object.entries(e.relationships).forEach(([relation, targets]) => {
          if (Array.isArray(targets)) {
            targets.forEach((target: string) => {
              const found = unique.find(u => u.name === target);
              if (found) {
                edges.push({
                  source: e.name,
                  target: found.name,
                  relation,
                });
              }
            });
          }
        });
      }
    });
    return { nodes, edges, entityCount: nodes.length, relationshipCount: edges.length };
  }

  async optimizeForAISearch(content: string): Promise<string> {
    const prompt = `Rewrite the following content to be optimized for AI search engines (Generative Engine Optimization / GEO).
Requirements:
- Use clear, factual statements that AI models can easily understand
- Include structured data markers naturally in the text
- Use entity-rich language
- Define key terms explicitly
- Use simple, direct sentences
- Include relevant context and relationships between concepts

Original content:
${content}

Return only the optimized content:`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2048 });
    return resp.content;
  }

  async generateEntityPages(orgId: string, entities: GEOEntity[]): Promise<any[]> {
    const pages: any[] = [];
    for (const entity of entities) {
      const prompt = `Generate a structured entity page for "${entity.name}" (type: ${entity.entityType}) for organization ${orgId}.
Description: ${entity.description}
Context: ${entity.context ?? ''}

Return JSON:
{
  "title": "string",
  "slug": "string",
  "metaDescription": "string",
  "content": "string (detailed description with entity context)",
  "schemaType": "string",
  "suggestedInternalLinks": ["string"]
}`;
      try {
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 1500 });
        pages.push(JSON.parse(resp.content));
      } catch {
        pages.push({
          entityName: entity.name,
          title: entity.name,
          slug: entity.name.toLowerCase().replace(/\s+/g, '-'),
          content: entity.description,
          schemaType: entity.entityType,
        });
      }
    }
    return pages;
  }

  async generateContextPages(orgId: string, topic: string): Promise<any> {
    const prompt = `Generate a comprehensive context page about "${topic}" for organization ${orgId}.
This page should help AI search engines understand the full context of this topic.

Return JSON:
{
  "title": "string",
  "slug": "string",
  "metaDescription": "string",
  "introduction": "string",
  "keyConcepts": [{"term": "string", "definition": "string"}],
  "relationships": [{"from": "string", "to": "string", "relation": "string"}],
  "relatedTopics": ["string"],
  "content": "string (detailed, entity-rich content)",
  "schemaType": "Article"
}`;
    const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 2000 });
    try {
      return JSON.parse(resp.content);
    } catch {
      return { title: topic, slug: topic.toLowerCase().replace(/\s+/g, '-'), content: resp.content };
    }
  }

  async createTopicClusters(orgId: string, topics: string[]): Promise<any[]> {
    const clusters: any[] = [];
    for (const topic of topics) {
      const prompt = `Create a topic cluster for "${topic}" for SEO/GEO optimization.
Return JSON:
{
  "pillarTopic": "string",
  "pillarContent": "string (overview of the pillar topic)",
  "clusterTopics": [{"title": "string", "slug": "string", "description": "string", "searchIntent": "string"}],
  "internalLinkingStrategy": ["string"]
}`;
      try {
        const resp = await this.ai.generate({ messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 1500 });
        const parsed = JSON.parse(resp.content);
        clusters.push({ orgId, ...parsed });
      } catch {
        clusters.push({ pillarTopic: topic, clusterTopics: [], internalLinkingStrategy: [] });
      }
    }
    return clusters;
  }
}
