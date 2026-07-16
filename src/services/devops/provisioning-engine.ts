import { createClient } from '@supabase/supabase-js';
import type { ProvisioningRequest, ProvisioningStatus } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

const PROVISIONING_STEPS = [
  'create_organization',
  'create_workspace',
  'generate_ai_workforce',
  'generate_api_keys',
  'deploy_ai_workforce',
  'configure_billing',
  'initialization_complete',
];

export class ProvisioningEngine {
  async provisionClient(data: ProvisioningRequest): Promise<{ provisioningId: string; status: ProvisioningStatus }> {
    const supabase = getSupabase();
    const provisioningId = crypto.randomUUID();

    await supabase.from('provisioning_queue').insert({
      id: provisioningId,
      organization_id: data.organizationId,
      plan: data.plan,
      features: data.features ?? [],
      white_label: data.whiteLabel ?? false,
      status: 'pending',
      current_step: 0,
      progress: 0,
      steps: PROVISIONING_STEPS.map((name, i) => ({ name, status: i === 0 ? 'pending' : 'pending' })),
      created_at: new Date().toISOString(),
    });

    this.processProvisioning(provisioningId, data).catch(() => {});

    const status = await this.getProvisioningStatus(provisioningId);
    return { provisioningId, status };
  }

  async getProvisioningStatus(provisioningId: string): Promise<ProvisioningStatus> {
    const supabase = getSupabase();
    const { data } = await supabase.from('provisioning_queue').select('*').eq('id', provisioningId).single();
    if (!data) throw new Error('Provisioning request not found');
    return {
      status: data.status,
      steps: data.steps,
      currentStep: data.current_step,
      progress: data.progress,
      error: data.error,
    };
  }

  private async processProvisioning(id: string, request: ProvisioningRequest): Promise<void> {
    const supabase = getSupabase();
    try {
      await this.updateStep(id, 0, 'processing');
      await this.createOrganization(request);

      await this.updateStep(id, 1, 'processing');
      await this.createWorkspace(request.organizationId);

      await this.updateStep(id, 2, 'processing');
      await this.generateAIWorkforce(request.organizationId, request.plan);

      await this.updateStep(id, 3, 'processing');
      await this.generateAPIKeys(request.organizationId);

      await this.updateStep(id, 4, 'processing');
      await this.deployAIWorkforce(request.organizationId);

      await this.updateStep(id, 5, 'processing');

      await this.updateStep(id, 6, 'processing');

      await supabase.from('provisioning_queue').update({
        status: 'completed',
        progress: 100,
        current_step: PROVISIONING_STEPS.length,
        steps: PROVISIONING_STEPS.map((name) => ({ name, status: 'completed', completedAt: new Date().toISOString() })),
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Provisioning failed';
      await supabase.from('provisioning_queue').update({
        status: 'failed',
        error: msg,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    }
  }

  private async updateStep(id: string, stepIndex: number, status: string): Promise<void> {
    const supabase = getSupabase();
    const { data } = await supabase.from('provisioning_queue').select('steps, current_step, progress').eq('id', id).single();
    if (!data) return;
    const steps: Array<{ name: string; status: string; completedAt?: string }> = data.steps ?? [];
    if (steps[stepIndex]) {
      steps[stepIndex] = { ...steps[stepIndex], status, completedAt: status === 'completed' ? new Date().toISOString() : undefined };
    }
    const progress = Math.round(((stepIndex + 1) / PROVISIONING_STEPS.length) * 100);
    await supabase.from('provisioning_queue').update({
      steps,
      current_step: stepIndex,
      progress,
      status: 'processing',
      updated_at: new Date().toISOString(),
    }).eq('id', id);
  }

  async createOrganization(data: ProvisioningRequest): Promise<string> {
    const supabase = getSupabase();
    const orgId = crypto.randomUUID();
    const { error } = await supabase.from('organizations').insert({
      id: orgId,
      name: `Organization ${orgId.slice(0, 8)}`,
      plan: data.plan,
      features: data.features ?? [],
      white_label: data.whiteLabel ?? false,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Failed to create organization: ${error.message}`);
    return orgId;
  }

  async createWorkspace(orgId: string): Promise<string> {
    const supabase = getSupabase();
    const wsId = crypto.randomUUID();
    const { error } = await supabase.from('workspaces').insert({
      id: wsId,
      organization_id: orgId,
      name: 'Default Workspace',
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Failed to create workspace: ${error.message}`);
    return wsId;
  }

  async generateAIWorkforce(orgId: string, industry: string): Promise<void> {
    const supabase = getSupabase();
    const defaultEmployees = [
      { name: 'Lead Generator', role: 'lead_generation', description: 'Generates and qualifies leads' },
      { name: 'Content Writer', role: 'content_creation', description: 'Creates marketing content' },
      { name: 'Analyst', role: 'analytics', description: 'Analyzes performance data' },
    ];
    for (const emp of defaultEmployees) {
      const { error } = await supabase.from('ai_employees').insert({
        id: crypto.randomUUID(),
        organization_id: orgId,
        name: emp.name,
        role: emp.role,
        description: emp.description,
        industry,
        status: 'inactive',
        created_at: new Date().toISOString(),
      });
      if (error) throw new Error(`Failed to create AI employee '${emp.name}': ${error.message}`);
    }
  }

  async generateAPIKeys(orgId: string): Promise<Array<{ keyId: string; key: string }>> {
    const supabase = getSupabase();
    const keys: Array<{ keyId: string; key: string }> = [];
    const scopes = ['read', 'write', 'admin'];
    for (const scope of scopes) {
      const keyId = crypto.randomUUID();
      const rawKey = `ba_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
      const keyHash = await this.hashKey(rawKey);
      const { error } = await supabase.from('api_keys').insert({
        id: keyId,
        organization_id: orgId,
        name: `${scope} key`,
        key_hash: keyHash,
        scopes: [scope],
        is_active: true,
        created_at: new Date().toISOString(),
      });
      if (error) throw new Error(`Failed to create API key: ${error.message}`);
      keys.push({ keyId, key: rawKey });
    }
    return keys;
  }

  async deployAIWorkforce(orgId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: employees } = await supabase.from('ai_employees').select('id').eq('organization_id', orgId);
    if (employees) {
      for (const emp of employees) {
        await supabase.from('ai_employees').update({ status: 'active' }).eq('id', emp.id);
      }
    }
  }

  private async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
