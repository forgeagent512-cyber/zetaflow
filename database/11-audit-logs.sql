-- ===========================================
-- Agent Forge Platform
-- File: 11-audit-logs.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- AUDIT LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS audit_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    action TEXT NOT NULL,

    resource TEXT NOT NULL,

    resource_id TEXT,

    details JSONB DEFAULT '{}',

    ip_address TEXT,

    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_audit_org
ON audit_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_user
ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_action
ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_created
ON audit_logs(created_at);

-- ===========================================
-- END OF FILE
-- ===========================================
