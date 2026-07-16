import { createClient } from '@supabase/supabase-js';
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
const VALID_TRANSITIONS = {
    pending: ['deploying', 'failed'],
    deploying: ['running', 'failed'],
    running: ['paused', 'stopped', 'failed'],
    paused: ['running', 'stopped', 'failed'],
    failed: ['pending', 'deploying'],
    stopped: ['pending', 'deploying'],
};
function validateTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
        throw new Error(`Invalid status transition from '${from}' to '${to}'`);
    }
}
export class DeploymentCenter {
    async createDeployment(data) {
        const supabase = getSupabase();
        const id = crypto.randomUUID();
        const deployment = { id, ...data, status: 'pending' };
        const { error } = await supabase.from('deployments').insert({
            id,
            organization_id: data.organizationId,
            name: data.name,
            type: data.type,
            status: 'pending',
            version: data.version,
            environment: data.environment,
            config: data.config,
            url: data.url,
            region: data.region,
            created_at: new Date().toISOString(),
        });
        if (error)
            throw new Error(error.message);
        await this.recordLog(id, 'created', `Deployment '${data.name}' created`);
        return deployment;
    }
    async getDeployments(orgId) {
        const supabase = getSupabase();
        const { data } = await supabase.from('deployments').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
        return (data ?? []).map(this.mapRow);
    }
    async getDeployment(id) {
        const supabase = getSupabase();
        const { data } = await supabase.from('deployments').select('*').eq('id', id).single();
        return data ? this.mapRow(data) : null;
    }
    async deploy(id) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        validateTransition(dep.status, 'deploying');
        const supabase = getSupabase();
        const { data, error } = await supabase.from('deployments').update({
            status: 'deploying',
            version: this.nextVersion(dep.version),
            updated_at: new Date().toISOString(),
        }).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        await this.recordLog(id, 'deploy', `Deployment '${dep.name}' started deploying`);
        return this.mapRow(data);
    }
    async pauseDeployment(id) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        validateTransition(dep.status, 'paused');
        const supabase = getSupabase();
        const { data, error } = await supabase.from('deployments').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        await this.recordLog(id, 'pause', `Deployment '${dep.name}' paused`);
        return this.mapRow(data);
    }
    async resumeDeployment(id) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        validateTransition(dep.status, 'running');
        const supabase = getSupabase();
        const { data, error } = await supabase.from('deployments').update({ status: 'running', updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        await this.recordLog(id, 'resume', `Deployment '${dep.name}' resumed`);
        return this.mapRow(data);
    }
    async restartDeployment(id) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        if (dep.status !== 'running' && dep.status !== 'failed' && dep.status !== 'stopped') {
            throw new Error('Can only restart running, failed, or stopped deployments');
        }
        const supabase = getSupabase();
        const { data, error } = await supabase.from('deployments').update({ status: 'deploying', updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        await this.recordLog(id, 'restart', `Deployment '${dep.name}' restarted`);
        return this.mapRow(data);
    }
    async cloneDeployment(id) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        const supabase = getSupabase();
        const newId = crypto.randomUUID();
        const { error } = await supabase.from('deployments').insert({
            id: newId,
            organization_id: dep.organizationId,
            name: `${dep.name} (clone)`,
            type: dep.type,
            status: 'pending',
            version: '1.0.0',
            environment: dep.environment,
            config: dep.config,
            region: dep.region,
            created_at: new Date().toISOString(),
        });
        if (error)
            throw new Error(error.message);
        await this.recordLog(newId, 'clone', `Deployment '${dep.name}' cloned`);
        return this.getDeployment(newId);
    }
    async rollbackDeployment(id, version) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        const supabase = getSupabase();
        const { data, error } = await supabase.from('deployments').update({ version, status: 'deploying', updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        await this.recordLog(id, 'rollback', `Deployment '${dep.name}' rolled back to ${version}`);
        return this.mapRow(data);
    }
    async deleteDeployment(id) {
        const dep = await this.getDeployment(id);
        if (!dep)
            throw new Error('Deployment not found');
        const supabase = getSupabase();
        const { error } = await supabase.from('deployment_logs').delete().eq('deployment_id', id);
        if (!error) {
            await supabase.from('deployments').delete().eq('id', id);
        }
    }
    async getDeploymentLogs(id) {
        const supabase = getSupabase();
        const { data } = await supabase.from('deployment_logs').select('*').eq('deployment_id', id).order('created_at', { ascending: true });
        return (data ?? []).map((r) => ({
            id: r.id,
            deploymentId: r.deployment_id,
            action: r.action,
            message: r.message,
            createdAt: r.created_at,
        }));
    }
    async recordLog(deploymentId, action, message) {
        try {
            const supabase = getSupabase();
            await supabase.from('deployment_logs').insert({
                id: crypto.randomUUID(),
                deployment_id: deploymentId,
                action,
                message,
                created_at: new Date().toISOString(),
            });
        }
        catch {
            // Non-blocking
        }
    }
    nextVersion(current) {
        if (!current)
            return '1.0.0';
        const parts = current.split('.').map(Number);
        parts[parts.length - 1] = (parts[parts.length - 1] ?? 0) + 1;
        return parts.join('.');
    }
    mapRow(row) {
        return {
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            type: row.type,
            status: row.status,
            version: row.version,
            environment: row.environment,
            config: row.config,
            url: row.url,
            region: row.region,
            healthStatus: row.health_status,
            lastHealthCheck: row.last_health_check,
        };
    }
}
