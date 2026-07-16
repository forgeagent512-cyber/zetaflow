-- ===========================================
-- AI Automation Platform
-- File: 03-crm.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- COMPANIES
-- ===========================================

CREATE TABLE IF NOT EXISTS companies (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    company_name TEXT NOT NULL,

    website TEXT,

    email TEXT,

    phone TEXT,

    industry TEXT,

    address TEXT,

    city TEXT,

    state TEXT,

    country TEXT,

    status TEXT DEFAULT 'active',

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- CONTACTS
-- ===========================================

CREATE TABLE IF NOT EXISTS contacts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    company_id UUID
    REFERENCES companies(id)
    ON DELETE SET NULL,

    first_name TEXT,

    last_name TEXT,

    full_name TEXT NOT NULL,

    email TEXT,

    phone TEXT,

    whatsapp TEXT,

    job_title TEXT,

    lead_source TEXT,

    tags TEXT[],

    notes TEXT,

    status TEXT DEFAULT 'new',

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- LEADS
-- ===========================================

CREATE TABLE IF NOT EXISTS leads (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE CASCADE,

    assigned_to UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    lead_title TEXT,

    pipeline TEXT DEFAULT 'default',

    stage TEXT DEFAULT 'new',

    priority TEXT DEFAULT 'medium',

    source TEXT,

    estimated_value NUMERIC(12,2),

    currency TEXT DEFAULT 'USD',

    probability INTEGER DEFAULT 0,

    expected_close_date DATE,

    status TEXT DEFAULT 'open',

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- CONVERSATIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS conversations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE CASCADE,

    ai_employee_id UUID,

    channel TEXT,

    subject TEXT,

    status TEXT DEFAULT 'open',

    started_at TIMESTAMP DEFAULT NOW(),

    closed_at TIMESTAMP

);

-- ===========================================
-- MESSAGES
-- ===========================================

CREATE TABLE IF NOT EXISTS messages (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID
    REFERENCES conversations(id)
    ON DELETE CASCADE,

    sender_type TEXT,

    sender_id UUID,

    message TEXT,

    attachments JSONB,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- NOTES
-- ===========================================

CREATE TABLE IF NOT EXISTS notes (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE CASCADE,

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    note TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- TASKS
-- ===========================================

CREATE TABLE IF NOT EXISTS tasks (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    assigned_to UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE SET NULL,

    lead_id UUID
    REFERENCES leads(id)
    ON DELETE SET NULL,

    title TEXT NOT NULL,

    description TEXT,

    priority TEXT DEFAULT 'medium',

    due_date TIMESTAMP,

    status TEXT DEFAULT 'pending',

    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- ACTIVITIES
-- ===========================================

CREATE TABLE IF NOT EXISTS activities (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    contact_id UUID
    REFERENCES contacts(id)
    ON DELETE SET NULL,

    lead_id UUID
    REFERENCES leads(id)
    ON DELETE SET NULL,

    activity_type TEXT,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_contacts_org
ON contacts(organization_id);

CREATE INDEX IF NOT EXISTS idx_companies_org
ON companies(organization_id);

CREATE INDEX IF NOT EXISTS idx_leads_org
ON leads(organization_id);

CREATE INDEX IF NOT EXISTS idx_conversations_org
ON conversations(organization_id);

CREATE INDEX IF NOT EXISTS idx_messages_conv
ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_tasks_org
ON tasks(organization_id);

CREATE INDEX IF NOT EXISTS idx_notes_contact
ON notes(contact_id);

CREATE INDEX IF NOT EXISTS idx_activity_org
ON activities(organization_id);

-- ===========================================
-- END OF FILE
-- ===========================================