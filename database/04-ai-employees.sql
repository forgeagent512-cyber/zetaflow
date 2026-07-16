-- ===========================================
-- AI Automation Platform
-- File: 04-ai-employees.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- AI EMPLOYEES
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_employees (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    employee_name TEXT NOT NULL,

    employee_slug TEXT UNIQUE,

    employee_type TEXT NOT NULL,

    category TEXT,

    description TEXT,

    avatar_url TEXT,

    ai_provider TEXT DEFAULT 'Gemini',

    ai_model TEXT DEFAULT 'gemini-2.5-pro',

    system_prompt TEXT,

    welcome_message TEXT,

    temperature NUMERIC(3,2) DEFAULT 0.7,

    max_tokens INTEGER DEFAULT 4096,

    status TEXT DEFAULT 'active',

    total_conversations INTEGER DEFAULT 0,

    total_messages INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI SKILLS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_skills (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    skill_name TEXT UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI EMPLOYEE SKILLS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_employee_skills (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    skill_id UUID
    REFERENCES ai_skills(id)
    ON DELETE CASCADE

);

-- ===========================================
-- AI ASSIGNMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_assignments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    assigned_to UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    assigned_module TEXT,

    status TEXT DEFAULT 'active',

    assigned_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- KNOWLEDGE BASES
-- ===========================================

CREATE TABLE IF NOT EXISTS knowledge_bases (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    knowledge_name TEXT,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- KNOWLEDGE DOCUMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS knowledge_documents (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    knowledge_base_id UUID
    REFERENCES knowledge_bases(id)
    ON DELETE CASCADE,

    file_name TEXT,

    file_type TEXT,

    file_url TEXT,

    file_size BIGINT,

    embedding_status TEXT DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI MEMORY
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_memory (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE CASCADE,

    memory_type TEXT,

    memory_key TEXT,

    memory_value TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE SET NULL,

    conversation_id UUID
    REFERENCES conversations(id)
    ON DELETE SET NULL,

    request_tokens INTEGER DEFAULT 0,

    response_tokens INTEGER DEFAULT 0,

    total_tokens INTEGER DEFAULT 0,

    response_time_ms INTEGER,

    model_used TEXT,

    status TEXT DEFAULT 'success',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI ACTIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_actions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    action_name TEXT,

    action_type TEXT,

    endpoint TEXT,

    configuration JSONB,

    status TEXT DEFAULT 'active',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_ai_org
ON ai_employees(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_logs_employee
ON ai_logs(ai_employee_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_employee
ON ai_memory(ai_employee_id);

CREATE INDEX IF NOT EXISTS idx_ai_assignment_employee
ON ai_assignments(ai_employee_id);

CREATE INDEX IF NOT EXISTS idx_kb_employee
ON knowledge_bases(ai_employee_id);

CREATE INDEX IF NOT EXISTS idx_doc_kb
ON knowledge_documents(knowledge_base_id);

-- ===========================================
-- DEFAULT SKILLS
-- ===========================================

INSERT INTO ai_skills (skill_name, description)
VALUES
('Lead Qualification','Qualify incoming leads'),
('Sales','Handle sales conversations'),
('Customer Support','Customer support agent'),
('Appointment Booking','Book meetings'),
('Email Automation','Email handling'),
('WhatsApp Automation','WhatsApp communication'),
('CRM Management','CRM updates'),
('Follow Up','Automatic follow-ups'),
('Knowledge Base Search','Search company knowledge'),
('Workflow Automation','Execute automations')
ON CONFLICT (skill_name) DO NOTHING;

-- ===========================================
-- END OF FILE
-- ===========================================