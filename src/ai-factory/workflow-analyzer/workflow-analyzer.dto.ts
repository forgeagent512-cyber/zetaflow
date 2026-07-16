export interface WorkflowAnalyzerInputDto {
  workflow_json: Record<string, unknown> | string;
  workflow_id?: string;
}

export interface WorkflowAnalyzerAnalysisDto {
  workflow_name: string;
  business_purpose: string;
  business_summary: string;
  industry: string;
  category: string;
  use_case: string;
  trigger_type: string;
  trigger_nodes: string[];
  action_nodes: string[];
  ai_nodes: string[];
  total_node_count: number;
  credentials_required: string[];
  required_integrations: string[];
  integrations_used: string[];
  external_apis: string[];
  saas_products_used: string[];
  ai_providers_used: string[];
  complexity_score: number;
  automation_score: number;
  reusability_score: number;
  suitable_industries: string[];
  required_environment_variables: string[];
  required_secrets: string[];
  required_connections: string[];
  node_types: string[];
  categories: string[];
  estimated_cost: number;
  human_readable_description: string;
  search_tags: string[];
  keywords: string[];
}

export interface WorkflowAnalysisRecordDto {
  id: string;
  workflow_id: string;
  metadata: Record<string, unknown>;
  embedding: number[];
  analysis: WorkflowAnalyzerAnalysisDto;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAnalyzerResponseDto extends WorkflowAnalysisRecordDto {}
