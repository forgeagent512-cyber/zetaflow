import { createClient } from '@supabase/supabase-js';
import { MonitoringCenter } from './monitoring-center.js';
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
export class LaunchCenter {
    async runProductionChecklist(orgId) {
        const checks = await Promise.all([
            ...await this.runHealthChecks(orgId),
            ...await this.runSecurityCheck(orgId),
            ...await this.runSEOReadiness(orgId),
            this.checkDeploymentConfig(orgId),
            this.checkLicenseStatus(orgId),
            this.checkBillingSetup(orgId),
            this.checkMonitoringConfig(orgId),
            this.checkBackupConfig(orgId),
        ]);
        const passed = checks.filter(c => c.status === 'pass').length;
        const total = checks.length;
        const score = Math.round((passed / total) * 100);
        return {
            organizationId: orgId,
            score,
            checks,
            passed,
            total,
            isReady: score >= 80 && checks.filter(c => c.status === 'fail').length === 0,
            generatedAt: new Date().toISOString(),
        };
    }
    async runHealthChecks(orgId) {
        const monitoring = new MonitoringCenter();
        const health = await monitoring.getSystemHealth(orgId);
        return health.map(h => ({
            name: `health_${h.component}`,
            status: h.status === 'healthy' ? 'pass' : h.status === 'degraded' ? 'warn' : 'fail',
            message: h.message ?? `${h.component} is ${h.status}`,
            details: h.metrics,
        }));
    }
    async runSecurityCheck(orgId) {
        const supabase = getSupabase();
        const results = [];
        const { data: apiKeys } = await supabase.from('api_keys').select('*').eq('organization_id', orgId);
        const hasActiveKeys = (apiKeys ?? []).some(k => k.is_active);
        results.push({
            name: 'security_api_keys',
            status: hasActiveKeys ? 'pass' : 'warn',
            message: hasActiveKeys ? 'Active API keys configured' : 'No active API keys found',
        });
        const { data: credentials } = await supabase.from('credentials').select('id').eq('organization_id', orgId);
        results.push({
            name: 'security_credentials',
            status: (credentials ?? []).length > 0 ? 'pass' : 'warn',
            message: `${(credentials ?? []).length} credential(s) stored in vault`,
        });
        const { data: users } = await supabase.from('organization_users').select('user_id').eq('organization_id', orgId);
        results.push({
            name: 'security_users',
            status: (users ?? []).length > 0 ? 'pass' : 'fail',
            message: `${(users ?? []).length} user(s) configured`,
        });
        return results;
    }
    async runSEOReadiness(orgId) {
        const supabase = getSupabase();
        const results = [];
        const { data: settings } = await supabase.from('white_label_settings').select('*').eq('organization_id', orgId).single();
        results.push({
            name: 'seo_branding',
            status: settings ? 'pass' : 'warn',
            message: settings ? 'Branding configured' : 'No white label settings found',
        });
        return results;
    }
    async checkDeploymentConfig(orgId) {
        const supabase = getSupabase();
        const { data: deployments } = await supabase.from('deployments').select('status').eq('organization_id', orgId);
        const running = (deployments ?? []).filter(d => d.status === 'running').length;
        return {
            name: 'deployment_config',
            status: running > 0 ? 'pass' : 'warn',
            message: `${running} deployment(s) running`,
            details: { total: (deployments ?? []).length, running },
        };
    }
    async checkLicenseStatus(orgId) {
        const supabase = getSupabase();
        const { data: license } = await supabase.from('licenses').select('*').eq('organization_id', orgId).single();
        if (!license)
            return { name: 'license_status', status: 'fail', message: 'No license found' };
        const validUntil = new Date(license.valid_until);
        const daysLeft = Math.floor((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
            name: 'license_status',
            status: license.status === 'active' ? 'pass' : 'fail',
            message: `${license.plan} license - ${daysLeft} days remaining`,
            details: { plan: license.plan, status: license.status, daysLeft },
        };
    }
    async checkBillingSetup(orgId) {
        const hasStripe = !!process.env.STRIPE_SECRET_KEY;
        return {
            name: 'billing_setup',
            status: hasStripe ? 'pass' : 'warn',
            message: hasStripe ? 'Billing provider configured' : 'No billing provider configured',
        };
    }
    async checkMonitoringConfig(orgId) {
        const supabase = getSupabase();
        const { data: metrics } = await supabase.from('monitoring_metrics').select('id').eq('organization_id', orgId).limit(1);
        return {
            name: 'monitoring_config',
            status: (metrics ?? []).length > 0 ? 'pass' : 'warn',
            message: (metrics ?? []).length > 0 ? 'Monitoring metrics recorded' : 'No monitoring data yet',
        };
    }
    async checkBackupConfig(orgId) {
        const supabase = getSupabase();
        const { data: schedule } = await supabase.from('backup_schedules').select('*').eq('organization_id', orgId).single();
        const { data: backups } = await supabase.from('backups').select('id').eq('organization_id', orgId).limit(1);
        return {
            name: 'backup_config',
            status: schedule || (backups ?? []).length > 0 ? 'pass' : 'warn',
            message: schedule ? 'Backup schedule configured' : (backups ?? []).length > 0 ? 'Backups exist' : 'No backup configuration',
        };
    }
    async generateLaunchReport(orgId) {
        return this.runProductionChecklist(orgId);
    }
    async isReadyForLaunch(orgId) {
        const report = await this.runProductionChecklist(orgId);
        return { ready: report.isReady, report };
    }
}
