import { createClient } from '@supabase/supabase-js';
import type { MonitoringMetric, SystemHealth } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function generateId(): string {
  return crypto.randomUUID();
}

export class MonitoringCenter {
  async recordMetric(orgId: string, metric: MonitoringMetric): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('monitoring_metrics').insert({
      id: generateId(),
      organization_id: orgId,
      metric_type: metric.metricType,
      value: metric.value,
      unit: metric.unit,
      tags: metric.tags ?? {},
      recorded_at: metric.recordedAt ?? new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }

  async getMetrics(orgId: string, type?: string, period?: { start: string; end: string }): Promise<MonitoringMetric[]> {
    const supabase = getSupabase();
    let query = supabase.from('monitoring_metrics').select('*').eq('organization_id', orgId).order('recorded_at', { ascending: false });
    if (type) query = query.eq('metric_type', type);
    if (period?.start) query = query.gte('recorded_at', period.start);
    if (period?.end) query = query.lte('recorded_at', period.end);
    const { data } = await query.limit(1000);
    return (data ?? []).map((r: any) => ({
      metricType: r.metric_type,
      value: r.value,
      unit: r.unit,
      tags: r.tags,
      recordedAt: r.recorded_at,
    }));
  }

  async getSystemHealth(orgId: string): Promise<SystemHealth[]> {
    const components = await Promise.all([
      this.getOverallHealth(orgId),
      this.getProviderHealth(),
      this.getDeploymentHealth(orgId),
      this.getBillingHealth(orgId),
      this.getDatabaseHealth(),
      this.getQueueHealth(),
      this.getWorkerHealth(),
    ]);
    return components;
  }

  async getOverallHealth(orgId: string): Promise<SystemHealth> {
    const supabase = getSupabase();
    const components = await this.getSystemHealth(orgId);
    const hasError = components.some(c => c.status === 'error');
    const hasDegraded = components.some(c => c.status === 'degraded');
    return {
      component: 'overall',
      status: hasError ? 'error' : hasDegraded ? 'degraded' : 'healthy',
      metrics: { totalComponents: components.length, errorCount: components.filter(c => c.status === 'error').length },
    };
  }

  async getProviderHealth(): Promise<SystemHealth> {
    try {
      const baseUrl = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
      const response = await fetch(`${baseUrl}/models`, {
        signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ''}` },
      });
      return {
        component: 'provider',
        status: response.ok ? 'healthy' : 'degraded',
        message: response.ok ? undefined : `Provider returned status ${response.status}`,
        metrics: { statusCode: response.status },
      };
    } catch (error) {
      return {
        component: 'provider',
        status: 'error',
        message: error instanceof Error ? error.message : 'Provider unreachable',
      };
    }
  }

  async getDeploymentHealth(orgId: string): Promise<SystemHealth> {
    const supabase = getSupabase();
    const { data: deployments } = await supabase.from('deployments').select('status').eq('organization_id', orgId);
    if (!deployments || deployments.length === 0) {
      return { component: 'deployment', status: 'healthy', message: 'No deployments found' };
    }
    const failed = deployments.filter(d => d.status === 'failed').length;
    const running = deployments.filter(d => d.status === 'running').length;
    return {
      component: 'deployment',
      status: failed > 0 ? 'degraded' : 'healthy',
      metrics: { total: deployments.length, running, failed },
    };
  }

  async getBillingHealth(orgId: string): Promise<SystemHealth> {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return { component: 'billing', status: 'healthy', message: 'Billing not configured' };
      return { component: 'billing', status: 'healthy' };
    } catch {
      return { component: 'billing', status: 'degraded', message: 'Billing service check failed' };
    }
  }

  async getDatabaseHealth(): Promise<SystemHealth> {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('organizations').select('id', { count: 'exact', head: true });
      return {
        component: 'database',
        status: error ? 'degraded' : 'healthy',
        message: error?.message,
      };
    } catch (error) {
      return {
        component: 'database',
        status: 'error',
        message: error instanceof Error ? error.message : 'Database unreachable',
      };
    }
  }

  async getQueueHealth(): Promise<SystemHealth> {
    try {
      const supabase = getSupabase();
      const { count } = await supabase.from('provisioning_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      return {
        component: 'queue',
        status: 'healthy',
        metrics: { pendingJobs: count ?? 0 },
      };
    } catch {
      return { component: 'queue', status: 'healthy', metrics: { pendingJobs: 0 } };
    }
  }

  async getWorkerHealth(): Promise<SystemHealth> {
    try {
      const supabase = getSupabase();
      const { data: workers } = await supabase.from('worker_status').select('*').limit(10);
      const active = (workers ?? []).filter(w => w.status === 'active').length;
      return {
        component: 'worker',
        status: active > 0 ? 'healthy' : 'degraded',
        metrics: { active, total: (workers ?? []).length },
      };
    } catch {
      return { component: 'worker', status: 'healthy', metrics: { active: 0, total: 0 } };
    }
  }
}
