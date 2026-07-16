import type { SupabaseClient } from '@supabase/supabase-js';

export interface DeployCredentials {
  n8nUrl?: string;
  n8nApiKey?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  openrouterKey?: string;
  [key: string]: string | undefined;
}

export interface DeployRequest {
  organizationId: string;
  templateId: string;
  credentials: DeployCredentials;
  environment?: Record<string, string>;
}

export interface DeployResult {
  success: boolean;
  deploymentId: string;
  workflowId?: string;
  status: string;
  urls?: {
    webhook?: string;
    dashboard?: string;
  };
  errors?: string[];
}

export class OneClickDeployService {
  async validateCredentials(credentials: DeployCredentials): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (credentials.n8nUrl && !credentials.n8nUrl.startsWith('http')) {
      errors.push('n8n URL must start with http:// or https://');
    }

    if (credentials.n8nApiKey && credentials.n8nApiKey.length < 10) {
      errors.push('n8n API key appears invalid (too short)');
    }

    if (credentials.supabaseUrl && !credentials.supabaseUrl.includes('supabase.co')) {
      errors.push('Supabase URL appears invalid');
    }

    if (credentials.n8nUrl && credentials.n8nApiKey) {
      try {
        const response = await fetch(`${credentials.n8nUrl.replace(/\/$/, '')}/healthz`, {
          headers: { 'X-N8N-API-KEY': credentials.n8nApiKey },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          errors.push('n8n health check failed - check your URL and API key');
        }
      } catch {
        errors.push('Cannot reach n8n instance - check the URL');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async deploy(supabase: SupabaseClient, request: DeployRequest): Promise<DeployResult> {
    const { valid, errors: validationErrors } = await this.validateCredentials(request.credentials);

    if (!valid) {
      return { success: false, deploymentId: '', status: 'validation_failed', errors: validationErrors };
    }

    const { data: template } = await supabase
      .from('automation_templates')
      .select('*')
      .eq('id', request.templateId)
      .single();

    if (!template) {
      return { success: false, deploymentId: '', status: 'template_not_found', errors: ['Template not found'] };
    }

    const deploymentId = crypto.randomUUID();

    const { error: deployError } = await supabase.from('workflow_deployments').insert({
      id: deploymentId,
      template_id: request.templateId,
      organization_id: request.organizationId,
      deployment_provider: request.credentials.n8nUrl ? 'n8n' : 'internal',
      deployment_status: 'deploying',
      deployment_url: request.credentials.n8nUrl,
      created_at: new Date().toISOString(),
    });

    if (deployError) {
      return { success: false, deploymentId: '', status: 'db_error', errors: [deployError.message] };
    }

    let workflowId: string | undefined;
    let n8nError: string | undefined;

    if (request.credentials.n8nUrl && request.credentials.n8nApiKey) {
      try {
        const n8nResponse = await fetch(`${request.credentials.n8nUrl.replace(/\/$/, '')}/workflows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': request.credentials.n8nApiKey,
          },
          body: JSON.stringify({
            name: template.template_name,
            nodes: template.workflow_json?.nodes ?? [],
            connections: template.workflow_json?.connections ?? {},
            settings: template.workflow_json?.settings ?? {},
            staticData: null,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (n8nResponse.ok) {
          const n8nResult = await n8nResponse.json() as Record<string, unknown>;
          workflowId = String(n8nResult.id ?? '');

          await supabase.from('workflow_deployments').update({
            deployment_id: workflowId,
            deployment_status: 'active',
            deployed_at: new Date().toISOString(),
          }).eq('id', deploymentId);
        } else {
          n8nError = `n8n deploy failed with status ${n8nResponse.status}`;
          await supabase.from('workflow_deployments').update({
            deployment_status: 'failed',
          }).eq('id', deploymentId);
        }
      } catch (error) {
        n8nError = error instanceof Error ? error.message : 'n8n deploy failed';
        await supabase.from('workflow_deployments').update({
          deployment_status: 'failed',
        }).eq('id', deploymentId);
      }
    }

    if (n8nError) {
      return {
        success: false,
        deploymentId,
        status: 'failed',
        errors: [n8nError],
      };
    }

    return {
      success: true,
      deploymentId,
      workflowId,
      status: 'active',
      urls: {
        webhook: request.credentials.n8nUrl ? `${request.credentials.n8nUrl.replace(/\/$/, '')}/webhook/${template.slug ?? template.id}` : undefined,
      },
    };
  }
}
