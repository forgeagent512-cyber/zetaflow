export interface TemplateSearchInputDto {
  workflow_json?: Record<string, unknown> | string;
  business_purpose?: string;
  industry?: string;
  category?: string;
  trigger?: string;
  integrations?: string[];
  services?: string[];
  tags?: string[];
  ai_provider?: string;
  complexity?: number;
  node_types?: string[];
}

export interface TemplateMatchDto {
  template_id: string;
  template_name: string;
  similarity_score: number;
  decision: 'reuse' | 'merge' | 'generate';
  workflow_json?: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface TemplateSearchResponseDto {
  decision: 'reuse' | 'merge' | 'generate';
  matches: TemplateMatchDto[];
  reason: string;
}
