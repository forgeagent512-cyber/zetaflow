import { MODEL_COSTS } from '../ai-provider/model-registry.js';
import { createSupabaseClient } from '../supabase/supabase-client.js';
const TIER_COST_MULTIPLIERS = {
    economy: 1,
    balanced: 2.5,
    premium: 10,
    enterprise: 50
};
function estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
}
const ESTIMATED_OUTPUT_RATIO = 0.4;
function getModelCostEntry(model) {
    const cached = MODEL_COSTS[model];
    if (cached) {
        return { inputCostPer1K: cached.inputCostPer1K, outputCostPer1K: cached.outputCostPer1K };
    }
    for (const [key, cost] of Object.entries(MODEL_COSTS)) {
        if (model.endsWith(key) || key.endsWith(model)) {
            return { inputCostPer1K: cost.inputCostPer1K, outputCostPer1K: cost.outputCostPer1K };
        }
    }
    return { inputCostPer1K: 0.0001, outputCostPer1K: 0.0004 };
}
export class CostOptimizer {
    supabase;
    constructor(supabase) {
        this.supabase = supabase ?? createSupabaseClient();
    }
    async trackUsage(request, response) {
        const { error } = await this.supabase.from('ai_usage_logs').insert({
            organization_id: request.orgId ?? 'unknown',
            task_type: response.taskType,
            model: response.model,
            provider: response.provider,
            tier: response.tier,
            prompt_tokens: response.usage.promptTokens,
            completion_tokens: response.usage.completionTokens,
            total_tokens: response.usage.totalTokens,
            total_cost: response.cost.totalCost,
            cost_per_token: response.cost.costPerToken,
            latency_ms: Math.round(response.latency * 1000),
            created_at: new Date().toISOString()
        });
        if (error) {
            const fallback = [];
            fallback.push({
                timestamp: new Date().toISOString(),
                request: { taskType: response.taskType, model: response.model },
                usage: response.usage,
                cost: response.cost
            });
            const existingRaw = process.env.AI_COST_FALLBACK ? JSON.parse(process.env.AI_COST_FALLBACK) : [];
            const updated = [...existingRaw, ...fallback].slice(-1000);
            try {
                process.env.AI_COST_FALLBACK = JSON.stringify(updated);
            }
            catch {
                // in-memory fallback exhausted
            }
        }
    }
    estimateCost(model, prompt, tier) {
        const { inputCostPer1K, outputCostPer1K } = getModelCostEntry(model);
        const multiplier = TIER_COST_MULTIPLIERS[tier];
        const inputTokens = estimateTokenCount(prompt);
        const outputTokens = Math.ceil(inputTokens * ESTIMATED_OUTPUT_RATIO);
        const inputCost = (inputTokens / 1000) * inputCostPer1K * multiplier;
        const outputCost = (outputTokens / 1000) * outputCostPer1K * multiplier;
        const estimatedCost = Number((inputCost + outputCost).toFixed(10));
        const provider = model.includes('/') ? model.split('/')[0] : 'openrouter';
        return {
            model,
            provider,
            tier,
            inputTokens,
            outputTokens,
            estimatedCost,
            currency: 'USD'
        };
    }
    async getUsageStats(orgId, period) {
        const now = new Date();
        let startDate;
        switch (period) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        const { data, error } = await this.supabase
            .from('ai_usage_logs')
            .select('*')
            .eq('organization_id', orgId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });
        if (error || !data) {
            return {
                organizationId: orgId,
                period,
                totalRequests: 0,
                totalTokens: 0,
                totalCost: 0,
                requestsByModel: {},
                requestsByTaskType: {},
                averageLatency: 0,
                error: error?.message ?? 'No data returned'
            };
        }
        const requestsByModel = {};
        const requestsByTaskType = {};
        let totalTokens = 0;
        let totalCost = 0;
        let totalLatency = 0;
        for (const row of data) {
            const record = row;
            const model = record.model ?? 'unknown';
            const taskType = record.task_type ?? 'unknown';
            const tokens = Number(record.total_tokens ?? 0);
            const cost = Number(record.total_cost ?? 0);
            const latency = Number(record.latency_ms ?? 0);
            requestsByModel[model] = (requestsByModel[model] ?? 0) + 1;
            requestsByTaskType[taskType] = (requestsByTaskType[taskType] ?? 0) + 1;
            totalTokens += tokens;
            totalCost += cost;
            totalLatency += latency;
        }
        return {
            organizationId: orgId,
            period,
            totalRequests: data.length,
            totalTokens,
            totalCost: Number(totalCost.toFixed(6)),
            requestsByModel,
            requestsByTaskType,
            averageLatency: data.length > 0 ? totalLatency / data.length : 0,
            generatedAt: now.toISOString()
        };
    }
    async getCostReport(filters) {
        let query = this.supabase
            .from('ai_usage_logs')
            .select('*');
        if (filters.organizationId) {
            query = query.eq('organization_id', filters.organizationId);
        }
        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }
        if (filters.model) {
            query = query.eq('model', filters.model);
        }
        if (filters.provider) {
            query = query.eq('provider', filters.provider);
        }
        if (filters.taskType) {
            query = query.eq('task_type', filters.taskType);
        }
        const { data, error } = await query.order('created_at', { ascending: false }).limit(filters.limit ?? 1000);
        if (error || !data) {
            return {
                filters,
                totalRecords: 0,
                totalCost: 0,
                records: [],
                error: error?.message ?? 'No data'
            };
        }
        let totalCost = 0;
        let totalTokens = 0;
        const records = data.map((row) => {
            const cost = Number(row.total_cost ?? 0);
            const tokens = Number(row.total_tokens ?? 0);
            totalCost += cost;
            totalTokens += tokens;
            return {
                id: row.id,
                organizationId: row.organization_id,
                taskType: row.task_type,
                model: row.model,
                provider: row.provider,
                tier: row.tier,
                promptTokens: row.prompt_tokens,
                completionTokens: row.completion_tokens,
                totalTokens: tokens,
                cost,
                latencyMs: row.latency_ms,
                createdAt: row.created_at
            };
        });
        return {
            filters,
            totalRecords: records.length,
            totalCost: Number(totalCost.toFixed(6)),
            totalTokens,
            records
        };
    }
}
