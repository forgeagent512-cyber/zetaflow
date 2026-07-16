-- ===========================================
-- AI Automation Platform
-- File: 05-automation-factory.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- ===========================================
-- AUTOMATION CATEGORIES
-- ===========================================

CREATE TABLE IF NOT EXISTS automation_categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_name TEXT UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AUTOMATION TEMPLATES
-- ===========================================

CREATE TABLE IF NOT EXISTS automation_templates (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    category_id UUID
    REFERENCES automation_categories(id)
    ON DELETE SET NULL,

    template_name TEXT NOT NULL,

    slug TEXT UNIQUE,

    industry_module TEXT,

    workflow_type TEXT DEFAULT 'automation',

    description TEXT,

    tags TEXT[],

    version TEXT DEFAULT '1.0',

    visibility TEXT DEFAULT 'marketplace',

    workflow_json JSONB NOT NULL,

    workflow_schema JSONB,

    embedding VECTOR(1536),

    price NUMERIC(10,2) DEFAULT 0,

    currency TEXT DEFAULT 'USD',

    total_downloads INTEGER DEFAULT 0,

    total_deployments INTEGER DEFAULT 0,

    average_rating NUMERIC(3,2) DEFAULT 0,

    status TEXT DEFAULT 'active',

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- TEMPLATE VERSIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS template_versions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_id UUID
    REFERENCES automation_templates(id)
    ON DELETE CASCADE,

    version TEXT,

    workflow_json JSONB,

    changelog TEXT,

    created_by UUID
    REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AUTOMATION REQUESTS
-- ===========================================

CREATE TABLE IF NOT EXISTS automation_requests (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    requested_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    client_name TEXT,

    client_email TEXT,

    client_phone TEXT,

    request_source TEXT DEFAULT 'website',

    industry_module TEXT,

    category TEXT,

    requirement_text TEXT NOT NULL,

    embedding VECTOR(1536),

    matched_template_id UUID
    REFERENCES automation_templates(id)
    ON DELETE SET NULL,

    similarity_score NUMERIC(5,4),

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE SET NULL,

    generated_workflow_json JSONB,

    estimated_build_time INTEGER,

    estimated_cost NUMERIC(10,2),

    priority TEXT DEFAULT 'medium',

    review_status TEXT DEFAULT 'pending',

    status TEXT DEFAULT 'pending',

    deployed_workflow_id TEXT,

    deployment_url TEXT,

    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- DEPLOYMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS workflow_deployments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_id UUID
    REFERENCES automation_templates(id)
    ON DELETE CASCADE,

    request_id UUID
    REFERENCES automation_requests(id)
    ON DELETE CASCADE,

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    deployed_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    deployment_provider TEXT,

    deployment_id TEXT,

    deployment_url TEXT,

    deployment_status TEXT DEFAULT 'deploying',

    deployed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- EXECUTION LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS workflow_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    deployment_id UUID
    REFERENCES workflow_deployments(id)
    ON DELETE CASCADE,

    execution_status TEXT,

    execution_time_ms INTEGER,

    trigger_source TEXT,

    input_data JSONB,

    output_data JSONB,

    error_message TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- MARKETPLACE RATINGS
-- ===========================================

CREATE TABLE IF NOT EXISTS template_reviews (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_id UUID
    REFERENCES automation_templates(id)
    ON DELETE CASCADE,

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    rating INTEGER CHECK (rating >=1 AND rating <=5),

    review TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- MATCH FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION match_templates(

    query_embedding VECTOR(1536),

    similarity_threshold FLOAT DEFAULT 0.80,

    result_count INT DEFAULT 5

)

RETURNS TABLE(

    template_id UUID,

    template_name TEXT,

    similarity FLOAT,

    workflow_json JSONB

)

LANGUAGE plpgsql

AS $$

BEGIN

RETURN QUERY

SELECT

t.id,

t.template_name,

1 - (t.embedding <=> query_embedding) AS similarity,

t.workflow_json

FROM automation_templates t

WHERE

t.status='active'

AND

1 - (t.embedding <=> query_embedding) >= similarity_threshold

ORDER BY t.embedding <=> query_embedding

LIMIT result_count;

END;

$$;

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_template_org
ON automation_templates(organization_id);

CREATE INDEX IF NOT EXISTS idx_template_category
ON automation_templates(category_id);

CREATE INDEX IF NOT EXISTS idx_request_org
ON automation_requests(organization_id);

CREATE INDEX IF NOT EXISTS idx_request_status
ON automation_requests(status);

CREATE INDEX IF NOT EXISTS idx_deployment_org
ON workflow_deployments(organization_id);

CREATE INDEX IF NOT EXISTS idx_logs_deployment
ON workflow_logs(deployment_id);

CREATE INDEX IF NOT EXISTS idx_template_embedding
ON automation_templates
USING ivfflat (embedding vector_cosine_ops);

-- ===========================================
-- DEFAULT CATEGORIES
-- ===========================================

INSERT INTO automation_categories(category_name,description)
VALUES

('Sales','Sales Automation'),

('Marketing','Marketing Automation'),

('Customer Support','Support Automation'),

('HR','Human Resource'),

('Finance','Finance Automation'),

('Operations','Operations'),

('CRM','CRM Automation'),

('AI Employee','AI Employees'),

('Integrations','Third Party Integrations'),

('Custom','Custom Workflows')

ON CONFLICT(category_name) DO NOTHING;

-- ===========================================
-- END OF FILE
-- ===========================================