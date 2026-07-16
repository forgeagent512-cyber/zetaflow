-- ===========================================
-- AI Automation Platform
-- File: 12-sprint5-ai-orchestrator.sql
-- Version: 2.0
-- Description: AI Model Router, Orchestrator,
-- Cost Optimizer, Prompt Manager, AI Memory,
-- Knowledge Engine, Vector Search, AI Playground
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- AI MODELS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_models (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider TEXT NOT NULL,

    model_id TEXT NOT NULL,

    display_name TEXT,

    quality_tier TEXT DEFAULT 'balanced'
        CHECK (quality_tier IN ('economy','balanced','premium','enterprise')),

    task_types TEXT[] DEFAULT '{}',

    capabilities JSONB DEFAULT '{}',

    is_free BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    context_window INTEGER DEFAULT 4096,

    max_tokens INTEGER DEFAULT 4096,

    input_cost_per_1k NUMERIC(10,6) DEFAULT 0,

    output_cost_per_1k NUMERIC(10,6) DEFAULT 0,

    latency_score NUMERIC(3,2),

    reliability_score NUMERIC(3,2),

    availability_score NUMERIC(3,2),

    overall_score NUMERIC(3,2),

    last_health_check TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(provider, model_id)

);

-- ===========================================
-- AI TASK CLASSIFICATIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_task_classifications (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prompt_hash TEXT UNIQUE NOT NULL,

    task_type TEXT NOT NULL,

    confidence NUMERIC(5,4) DEFAULT 0,

    classified_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI COST LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_cost_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    employee_id UUID
        REFERENCES ai_employees(id)
        ON DELETE SET NULL,

    agent_id UUID,

    workflow_id UUID,

    client_id UUID,

    request_id TEXT,

    model TEXT,

    provider TEXT,

    quality_tier TEXT,

    task_type TEXT,

    input_tokens INTEGER DEFAULT 0,

    output_tokens INTEGER DEFAULT 0,

    total_tokens INTEGER DEFAULT 0,

    estimated_cost NUMERIC(12,8),

    actual_cost NUMERIC(12,8),

    latency_ms INTEGER,

    status TEXT DEFAULT 'success',

    error TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI PROMPTS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_prompts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    description TEXT,

    category TEXT DEFAULT 'business_analyzer'
        CHECK (category IN (
            'business_analyzer','workflow_generator','employee_generator',
            'agent_generator','knowledge_generator','prompt_generator',
            'marketing','seo','support','sales'
        )),

    content TEXT NOT NULL,

    version INTEGER DEFAULT 1,

    variables JSONB DEFAULT '{}',

    tags TEXT[] DEFAULT '{}',

    is_active BOOLEAN DEFAULT TRUE,

    is_template BOOLEAN DEFAULT FALSE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI PROMPT VERSIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_prompt_versions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prompt_id UUID
        REFERENCES ai_prompts(id)
        ON DELETE CASCADE,

    version INTEGER NOT NULL,

    content TEXT NOT NULL,

    variables JSONB DEFAULT '{}',

    changelog TEXT,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(prompt_id, version)

);

-- ===========================================
-- AI MEMORY
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_memory (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    employee_id UUID
        REFERENCES ai_employees(id)
        ON DELETE CASCADE,

    agent_id UUID,

    memory_type TEXT DEFAULT 'short_term'
        CHECK (memory_type IN ('long_term','short_term','conversation','knowledge')),

    content TEXT NOT NULL,

    metadata JSONB DEFAULT '{}',

    relevance_score NUMERIC(5,4) DEFAULT 0,

    context_window INTEGER,

    expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI MEMORY CLEANUP LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_memory_cleanup_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    entries_removed INTEGER DEFAULT 0,

    reason TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- KNOWLEDGE BASES
-- ===========================================

CREATE TABLE IF NOT EXISTS knowledge_bases (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    description TEXT,

    type TEXT DEFAULT 'pdf'
        CHECK (type IN ('pdf','docx','txt','csv','excel','url','image','markdown')),

    status TEXT DEFAULT 'processing'
        CHECK (status IN ('processing','ready','error')),

    chunk_count INTEGER DEFAULT 0,

    embedding_count INTEGER DEFAULT 0,

    metadata JSONB DEFAULT '{}',

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- KNOWLEDGE CHUNKS
-- ===========================================

CREATE TABLE IF NOT EXISTS knowledge_chunks (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    knowledge_base_id UUID
        REFERENCES knowledge_bases(id)
        ON DELETE CASCADE,

    content TEXT NOT NULL,

    chunk_index INTEGER DEFAULT 0,

    embedding VECTOR(1536),

    metadata JSONB DEFAULT '{}',

    tokens INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- KNOWLEDGE SEARCHES
-- ===========================================

CREATE TABLE IF NOT EXISTS knowledge_searches (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    query TEXT NOT NULL,

    result_count INTEGER DEFAULT 0,

    search_type TEXT DEFAULT 'semantic'
        CHECK (search_type IN ('semantic','hybrid','similarity')),

    filters JSONB DEFAULT '{}',

    latency_ms INTEGER,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI PLAYGROUND SESSIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_playground_sessions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,

    name TEXT,

    prompt TEXT,

    model TEXT,

    provider TEXT,

    quality_tier TEXT,

    temperature NUMERIC(3,2) DEFAULT 0.7,

    max_tokens INTEGER DEFAULT 4096,

    response TEXT,

    latency_ms INTEGER,

    input_tokens INTEGER,

    output_tokens INTEGER,

    cost NUMERIC(12,8),

    saved BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI HEALTH CHECKS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_health_checks (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider TEXT NOT NULL,

    model TEXT NOT NULL,

    status TEXT DEFAULT 'ok'
        CHECK (status IN ('ok','degraded','error','unhealthy')),

    latency_ms INTEGER,

    error_rate NUMERIC(5,4),

    rate_limited BOOLEAN DEFAULT FALSE,

    checked_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI FEEDBACK
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_feedback (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    request_id TEXT,

    model TEXT,

    provider TEXT,

    task_type TEXT,

    success BOOLEAN DEFAULT TRUE,

    error_type TEXT,

    score NUMERIC(3,2),

    feedback_data JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI ROUTING RULES
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_routing_rules (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    task_type TEXT NOT NULL,

    preferred_provider TEXT,

    preferred_model TEXT,

    quality_tier TEXT
        CHECK (quality_tier IN ('economy','balanced','premium','enterprise')),

    is_active BOOLEAN DEFAULT TRUE,

    priority INTEGER DEFAULT 0,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_ai_models_provider
ON ai_models(provider);

CREATE INDEX IF NOT EXISTS idx_ai_models_tier
ON ai_models(quality_tier);

CREATE INDEX IF NOT EXISTS idx_ai_models_active
ON ai_models(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_org
ON ai_cost_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_user
ON ai_cost_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_employee
ON ai_cost_logs(employee_id);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_model
ON ai_cost_logs(model);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_provider
ON ai_cost_logs(provider);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_task_type
ON ai_cost_logs(task_type);

CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_created
ON ai_cost_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_org
ON ai_prompts(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_category
ON ai_prompts(category);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_versions_prompt
ON ai_prompt_versions(prompt_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_org
ON ai_memory(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_employee
ON ai_memory(employee_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_agent
ON ai_memory(agent_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_type
ON ai_memory(memory_type);

CREATE INDEX IF NOT EXISTS idx_ai_memory_expires
ON ai_memory(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_memory_cleanup_org
ON ai_memory_cleanup_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_kb_org
ON knowledge_bases(organization_id);

CREATE INDEX IF NOT EXISTS idx_kb_type
ON knowledge_bases(type);

CREATE INDEX IF NOT EXISTS idx_kb_status
ON knowledge_bases(status);

CREATE INDEX IF NOT EXISTS idx_kb_chunks_base
ON knowledge_chunks(knowledge_base_id);

CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding
ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_kb_searches_org
ON knowledge_searches(organization_id);

CREATE INDEX IF NOT EXISTS idx_kb_searches_type
ON knowledge_searches(search_type);

CREATE INDEX IF NOT EXISTS idx_playground_org
ON ai_playground_sessions(organization_id);

CREATE INDEX IF NOT EXISTS idx_playground_user
ON ai_playground_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_health_provider
ON ai_health_checks(provider);

CREATE INDEX IF NOT EXISTS idx_health_model
ON ai_health_checks(model);

CREATE INDEX IF NOT EXISTS idx_health_status
ON ai_health_checks(status);

CREATE INDEX IF NOT EXISTS idx_health_checked
ON ai_health_checks(checked_at);

CREATE INDEX IF NOT EXISTS idx_feedback_org
ON ai_feedback(organization_id);

CREATE INDEX IF NOT EXISTS idx_feedback_model
ON ai_feedback(model);

CREATE INDEX IF NOT EXISTS idx_feedback_provider
ON ai_feedback(provider);

CREATE INDEX IF NOT EXISTS idx_feedback_task_type
ON ai_feedback(task_type);

CREATE INDEX IF NOT EXISTS idx_routing_rules_org
ON ai_routing_rules(organization_id);

CREATE INDEX IF NOT EXISTS idx_routing_rules_task_type
ON ai_routing_rules(task_type);

CREATE INDEX IF NOT EXISTS idx_routing_rules_active
ON ai_routing_rules(is_active);

-- ===========================================
-- END OF FILE
-- ===========================================
