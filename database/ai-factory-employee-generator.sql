CREATE TABLE IF NOT EXISTS ai_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    employee_name TEXT NOT NULL,
    department TEXT NOT NULL,
    industry TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    employee_json JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_employees_org
ON ai_employees(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_employees_name
ON ai_employees(employee_name);
