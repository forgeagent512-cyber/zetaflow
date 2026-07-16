import type { AiFactoryRequest, AiFactoryResponse } from '../shared/contracts.js';

export interface BusinessAnalyzerRequestDto extends AiFactoryRequest {
  industry: string;
  businessName: string;
  goal: string;
  requirements: string;
}

export interface DepartmentAnalysis {
  name: string;
  pain_points: string[];
  automation_opportunities: string[];
}

export interface SuggestedEmployee {
  name: string;
  role: string;
  department: string;
}

export interface SuggestedAgent {
  name: string;
  goal: string;
}

export interface SuggestedWorkflow {
  name: string;
  description: string;
  category: string;
}

export interface SuggestedIntegration {
  name: string;
  provider: string;
}

export interface Kpi {
  metric: string;
  target: string;
  measurement: string;
}

export interface RoiEstimate {
  upfront_cost: number;
  monthly_savings: number;
  payback_months: number;
  three_year_roi: number;
}

export interface BusinessAnalyzerAnalysisDto {
  company_summary: string;
  industry: string;
  department_analysis: DepartmentAnalysis[];
  pain_points: string[];
  automation_opportunities: string[];
  ai_opportunities: string[];
  suggested_employees: SuggestedEmployee[];
  suggested_agents: SuggestedAgent[];
  suggested_workflows: SuggestedWorkflow[];
  suggested_integrations: SuggestedIntegration[];
  kpis: Kpi[];
  roi_estimate: RoiEstimate;
  business_type: string;
  automation_type: string;
  recommended_ai_employees: string[];
  recommended_agents: string[];
  recommended_workflows: string[];
  required_integrations: string[];
  required_tools: string[];
  required_database_tables: string[];
  complexity: 'low' | 'medium' | 'high';
  estimated_build_time: number;
  estimated_cost: number;
  confidence: number;
}

export interface BusinessAnalyzerResponseDto extends AiFactoryResponse {
  organizationId: string;
  request: BusinessAnalyzerRequestDto;
  analysis: BusinessAnalyzerAnalysisDto;
  confidence: number;
}
