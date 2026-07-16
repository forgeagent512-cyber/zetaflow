import { ProviderFactory } from '../ai-provider/provider-factory.js';
const UNHEALTHY_THRESHOLD = 5;
const CONSECUTIVE_THRESHOLD = 3;
const COOLDOWN_PERIOD_MS = 5 * 60 * 1000;
const HEALTH_CHECK_INTERVAL_MS = 60 * 1000;
export class ProviderHealthMonitor {
    failureRecords = new Map();
    disabledModels = new Set();
    disabledProviders = new Set();
    healthCache = new Map();
    checkInterval = null;
    running = false;
    constructor() {
        this.startPeriodicCheck();
    }
    async checkHealth() {
        const providers = ['openrouter', 'openai', 'anthropic', 'gemini'];
        const results = [];
        for (const providerName of providers) {
            try {
                const status = await this.getProviderStatus(providerName);
                results.push(status);
            }
            catch {
                results.push({
                    provider: providerName,
                    status: 'unhealthy',
                    latency: 0,
                    errorRate: 1,
                    rateLimited: false,
                    lastChecked: new Date().toISOString(),
                    models: []
                });
            }
        }
        const now = Date.now();
        for (const result of results) {
            this.healthCache.set(result.provider, { status: result, timestamp: now });
        }
        return results;
    }
    async getProviderStatus(provider) {
        const now = Date.now();
        const cached = this.healthCache.get(provider);
        if (cached && (now - cached.timestamp) < 30000) {
            return cached.status;
        }
        const startTime = Date.now();
        try {
            const providerInstance = ProviderFactory.create(provider);
            const health = await providerInstance.health();
            const latency = (Date.now() - startTime) / 1000;
            const failureStats = this.getFailureStats(provider);
            const errorRate = failureStats.totalFailures > 0
                ? failureStats.totalFailures / (failureStats.totalFailures + 10)
                : 0;
            const isRateLimited = failureStats.consecutiveFailures >= CONSECUTIVE_THRESHOLD;
            let status = 'ok';
            if (health.status === 'error' || this.disabledProviders.has(provider)) {
                status = 'unhealthy';
            }
            else if (health.status === 'degraded' || errorRate > 0.3 || isRateLimited) {
                status = 'degraded';
            }
            const models = await this.getProviderModels(provider);
            const result = {
                provider,
                status,
                latency,
                errorRate,
                rateLimited: isRateLimited,
                lastChecked: new Date().toISOString(),
                models
            };
            this.healthCache.set(provider, { status: result, timestamp: now });
            return result;
        }
        catch {
            return {
                provider,
                status: 'unhealthy',
                latency: (Date.now() - startTime) / 1000,
                errorRate: 1,
                rateLimited: false,
                lastChecked: new Date().toISOString(),
                models: []
            };
        }
    }
    async autoDisableUnhealthy() {
        const statuses = await this.checkHealth();
        for (const status of statuses) {
            if (status.status === 'unhealthy') {
                this.disabledProviders.add(status.provider);
                for (const model of status.models) {
                    if (model.status === 'error') {
                        this.disabledModels.add(model.model);
                    }
                }
            }
            else if (status.status === 'ok' && this.disabledProviders.has(status.provider)) {
                const failureStats = this.getFailureStats(status.provider);
                const timeSinceLastFailure = Date.now() - failureStats.lastFailure;
                if (timeSinceLastFailure > COOLDOWN_PERIOD_MS) {
                    this.disabledProviders.delete(status.provider);
                    this.clearFailures(status.provider);
                }
            }
        }
        for (const modelKey of this.disabledModels) {
            const record = this.failureRecords.get(modelKey);
            if (record && (Date.now() - record.lastFailure) > COOLDOWN_PERIOD_MS) {
                this.disabledModels.delete(modelKey);
                this.failureRecords.delete(modelKey);
            }
        }
    }
    async getModelStatus(model) {
        const record = this.failureRecords.get(model);
        const isDisabled = this.disabledModels.has(model);
        const provider = model.includes('/') ? model.split('/')[0] : 'unknown';
        let providerStatus = 'unknown';
        try {
            const ps = await this.getProviderStatus(provider);
            providerStatus = ps.status;
        }
        catch {
            providerStatus = 'unknown';
        }
        return {
            model,
            provider,
            providerStatus,
            disabled: isDisabled,
            failureCount: record?.failures ?? 0,
            consecutiveFailures: record?.consecutiveFailures ?? 0,
            lastFailure: record?.lastFailure ? new Date(record.lastFailure).toISOString() : null,
            healthy: !isDisabled && providerStatus !== 'unhealthy'
        };
    }
    recordFailure(provider, model) {
        const key = this.failureKey(provider, model);
        const now = Date.now();
        const existing = this.failureRecords.get(key);
        if (existing) {
            existing.failures++;
            existing.consecutiveFailures++;
            existing.lastFailure = now;
        }
        else {
            this.failureRecords.set(key, {
                provider,
                model,
                failures: 1,
                lastFailure: now,
                consecutiveFailures: 1
            });
        }
        if (existing && existing.consecutiveFailures >= CONSECUTIVE_THRESHOLD) {
            this.disabledModels.add(model);
        }
        if (existing && existing.failures >= UNHEALTHY_THRESHOLD) {
            this.disabledProviders.add(provider);
        }
    }
    isModelDisabled(model) {
        return this.disabledModels.has(model);
    }
    isProviderDisabled(provider) {
        return this.disabledProviders.has(provider);
    }
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.running = false;
    }
    startPeriodicCheck() {
        if (this.running)
            return;
        this.running = true;
        this.checkInterval = setInterval(() => {
            this.autoDisableUnhealthy().catch(() => { });
        }, HEALTH_CHECK_INTERVAL_MS);
        if (this.checkInterval && typeof this.checkInterval === 'object' && 'unref' in this.checkInterval) {
            this.checkInterval.unref();
        }
    }
    async getProviderModels(provider) {
        try {
            const providerInstance = ProviderFactory.create(provider);
            const features = providerInstance.getFeatures();
            return features.models.map(m => ({
                model: m,
                status: this.disabledModels.has(`${provider}/${m}`) || this.disabledModels.has(m) ? 'error' : 'ok',
                latency: 0
            }));
        }
        catch {
            return [];
        }
    }
    getFailureStats(provider) {
        let totalFailures = 0;
        let consecutiveFailures = 0;
        let lastFailure = 0;
        for (const record of this.failureRecords.values()) {
            if (record.provider === provider) {
                totalFailures += record.failures;
                consecutiveFailures = Math.max(consecutiveFailures, record.consecutiveFailures);
                lastFailure = Math.max(lastFailure, record.lastFailure);
            }
        }
        return { totalFailures, consecutiveFailures, lastFailure };
    }
    clearFailures(provider) {
        const keysToDelete = [];
        for (const [key, record] of this.failureRecords) {
            if (record.provider === provider) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.failureRecords.delete(key);
        }
    }
    failureKey(provider, model) {
        return `${provider}::${model}`;
    }
}
