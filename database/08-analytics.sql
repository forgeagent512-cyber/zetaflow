-- ===========================================
-- AI Automation Platform
-- File: 08-analytics.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ACTIVITY LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS activity_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    module TEXT,

    action TEXT,

    description TEXT,

    ip_address TEXT,

    device TEXT,

    browser TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

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

    table_name TEXT,

    record_id UUID,

    operation TEXT,

    old_data JSONB,

    new_data JSONB,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- SYSTEM EVENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS system_events (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    event_type TEXT,

    event_name TEXT,

    event_data JSONB,

    severity TEXT DEFAULT 'info',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- ERROR LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS error_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    service_name TEXT,

    error_message TEXT,

    stack_trace TEXT,

    payload JSONB,

    status TEXT DEFAULT 'open',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PERFORMANCE LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS performance_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    service_name TEXT,

    endpoint TEXT,

    response_time_ms INTEGER,

    cpu_usage NUMERIC(6,2),

    memory_usage NUMERIC(8,2),

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- AI USAGE
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_usage (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    ai_employee_id UUID
    REFERENCES ai_employees(id)
    ON DELETE CASCADE,

    total_requests INTEGER DEFAULT 0,

    total_tokens INTEGER DEFAULT 0,

    input_tokens INTEGER DEFAULT 0,

    output_tokens INTEGER DEFAULT 0,

    estimated_cost NUMERIC(10,4) DEFAULT 0,

    usage_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- DASHBOARD METRICS
-- ===========================================

CREATE TABLE IF NOT EXISTS dashboard_metrics (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    metric_name TEXT,

    metric_value NUMERIC(20,2),

    metric_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- REPORTS
-- ===========================================

CREATE TABLE IF NOT EXISTS reports (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    report_name TEXT,

    report_type TEXT,

    report_url TEXT,

    generated_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- NOTIFICATIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS notifications (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    title TEXT,

    message TEXT,

    notification_type TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- ANNOUNCEMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS announcements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT,

    message TEXT,

    target_role TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_activity_org
ON activity_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_org
ON audit_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_events_org
ON system_events(organization_id);

CREATE INDEX IF NOT EXISTS idx_errors_org
ON error_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_perf_org
ON performance_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_org
ON ai_usage(organization_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_org
ON dashboard_metrics(organization_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

-- ===========================================
-- END OF FILE
-- ===========================================