-- ===========================================
-- AI Automation Platform
-- File: 14-sprint7-devops-whitelabel.sql
-- Version: 2.0
-- Description: DevOps, White Label, Deployment,
-- Monitoring, Security & Enterprise features
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- 1. WHITE LABEL SETTINGS
-- ===========================================

CREATE TABLE IF NOT EXISTS white_label_settings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    logo_url TEXT,

    favicon_url TEXT,

    primary_color TEXT DEFAULT '#3B82F6',

    secondary_color TEXT DEFAULT '#10B981',

    accent_color TEXT DEFAULT '#F59E0B',

    font_family TEXT DEFAULT 'Inter',

    custom_domain TEXT,

    custom_email_domain TEXT,

    login_background TEXT,

    login_logo TEXT,

    footer_text TEXT,

    footer_links JSONB DEFAULT '[]',

    hide_branding BOOLEAN DEFAULT FALSE,

    custom_css TEXT,

    custom_js TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 2. DEPLOYMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS deployments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    type TEXT NOT NULL
    CHECK (type IN ('railway','docker','vps','n8n','database','storage')),

    status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','deploying','running','paused','failed','stopped')),

    version TEXT,

    environment TEXT NOT NULL DEFAULT 'development'
    CHECK (environment IN ('production','staging','development')),

    config JSONB DEFAULT '{}',

    url TEXT,

    region TEXT,

    health_status TEXT DEFAULT 'unknown',

    last_health_check TIMESTAMP,

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 3. DEPLOYMENT LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS deployment_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    deployment_id UUID NOT NULL
    REFERENCES deployments(id)
    ON DELETE CASCADE,

    level TEXT NOT NULL DEFAULT 'info'
    CHECK (level IN ('info','warn','error')),

    message TEXT NOT NULL,

    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 4. PROVISIONING QUEUE
-- ===========================================

CREATE TABLE IF NOT EXISTS provisioning_queue (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),

    steps JSONB DEFAULT '[]',

    current_step INTEGER DEFAULT 0,

    progress NUMERIC(5,2) DEFAULT 0,

    error TEXT,

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 5. ORGANIZATIONS EXTENDED
-- ===========================================

CREATE TABLE IF NOT EXISTS organizations_extended (

    id UUID PRIMARY KEY
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    subscription_status TEXT DEFAULT 'active',

    deployment_quota INTEGER DEFAULT 5,

    storage_quota BIGINT DEFAULT 1073741824,

    api_rate_limit INTEGER DEFAULT 1000,

    features JSONB DEFAULT '{}',

    white_label_enabled BOOLEAN DEFAULT FALSE,

    custom_domain TEXT,

    custom_domain_verified BOOLEAN DEFAULT FALSE,

    sso_enabled BOOLEAN DEFAULT FALSE,

    sso_config JSONB DEFAULT '{}',

    provisioning_status TEXT DEFAULT 'not_started',

    last_provisioned TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 6. API KEYS EXTENDED
-- ===========================================

CREATE TABLE IF NOT EXISTS api_keys_extended (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    key_hash TEXT NOT NULL,

    key_prefix TEXT NOT NULL,

    scopes TEXT[] DEFAULT '{}',

    rate_limit INTEGER DEFAULT 100,

    expires_at TIMESTAMP,

    last_used_at TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 7. CREDENTIAL VAULT
-- ===========================================

CREATE TABLE IF NOT EXISTS credential_vault (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    provider TEXT NOT NULL,

    encrypted_value TEXT NOT NULL,

    iv TEXT NOT NULL,

    key_identifier TEXT NOT NULL,

    metadata JSONB DEFAULT '{}',

    expires_at TIMESTAMP,

    last_accessed_at TIMESTAMP,

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 8. AUDIT LOGS EXTENDED
-- ===========================================

CREATE TABLE IF NOT EXISTS audit_logs_extended (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    action TEXT NOT NULL,

    resource_type TEXT NOT NULL,

    resource_id TEXT,

    details JSONB DEFAULT '{}',

    ip_address TEXT,

    user_agent TEXT,

    session_id TEXT,

    severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info','warn','critical')),

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 9. BACKUPS
-- ===========================================

CREATE TABLE IF NOT EXISTS backups (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    type TEXT NOT NULL
    CHECK (type IN ('auto_daily','auto_weekly','auto_monthly','manual')),

    status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','completed','failed')),

    size_bytes BIGINT DEFAULT 0,

    location TEXT,

    includes TEXT[] DEFAULT '{}',

    version TEXT,

    checksum TEXT,

    restored_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 10. MONITORING METRICS
-- ===========================================

CREATE TABLE IF NOT EXISTS monitoring_metrics (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    metric_type TEXT NOT NULL
    CHECK (metric_type IN ('cpu','ram','disk','queue','database','api','workers','deployments','errors','latency','health')),

    value NUMERIC NOT NULL,

    unit TEXT NOT NULL,

    tags JSONB DEFAULT '{}',

    recorded_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 11. NOTIFICATIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS notifications (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    channel TEXT NOT NULL DEFAULT 'dashboard'
    CHECK (channel IN ('email','dashboard','slack','discord','whatsapp','telegram','webhook')),

    title TEXT NOT NULL,

    message TEXT NOT NULL,

    type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info','success','warning','error')),

    category TEXT,

    priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','critical')),

    status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','read','dismissed')),

    sent_at TIMESTAMP,

    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 12. NOTIFICATION CHANNELS
-- ===========================================

CREATE TABLE IF NOT EXISTS notification_channels (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    channel TEXT NOT NULL
    CHECK (channel IN ('email','dashboard','slack','discord','whatsapp','telegram','webhook')),

    config JSONB DEFAULT '{}',

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 13. FEATURE FLAGS
-- ===========================================

CREATE TABLE IF NOT EXISTS feature_flags (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    key TEXT UNIQUE NOT NULL,

    description TEXT,

    is_enabled BOOLEAN DEFAULT FALSE,

    is_beta BOOLEAN DEFAULT FALSE,

    organizations UUID[] DEFAULT '{}',

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 14. LICENSES
-- ===========================================

CREATE TABLE IF NOT EXISTS licenses (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    license_key TEXT UNIQUE NOT NULL,

    plan TEXT NOT NULL
    CHECK (plan IN ('starter','professional','business','enterprise','agency','unlimited','lifetime')),

    status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','expired','revoked','suspended')),

    seats INTEGER DEFAULT 1,

    features TEXT[] DEFAULT '{}',

    valid_from DATE NOT NULL,

    valid_until DATE,

    auto_renew BOOLEAN DEFAULT FALSE,

    last_validated TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 15. SYSTEM HEALTH
-- ===========================================

CREATE TABLE IF NOT EXISTS system_health (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    component TEXT NOT NULL
    CHECK (component IN ('overall','provider','deployment','billing','database','queue','worker')),

    status TEXT NOT NULL
    CHECK (status IN ('healthy','degraded','error')),

    message TEXT,

    metrics JSONB DEFAULT '{}',

    checked_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 16. IMPORT EXPORT JOBS
-- ===========================================

CREATE TABLE IF NOT EXISTS import_export_jobs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    type TEXT NOT NULL
    CHECK (type IN ('import','export')),

    entity_type TEXT NOT NULL
    CHECK (entity_type IN ('employees','agents','templates','workflows','knowledge','settings','projects','organizations')),

    status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),

    file_url TEXT,

    file_size BIGINT DEFAULT 0,

    progress NUMERIC(5,2) DEFAULT 0,

    error TEXT,

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 17. PWA SUBSCRIPTIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS pwa_subscriptions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

    endpoint TEXT NOT NULL,

    p256dh_key TEXT NOT NULL,

    auth_key TEXT NOT NULL,

    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

-- White Label Settings
CREATE INDEX IF NOT EXISTS idx_white_label_org
ON white_label_settings(organization_id);

CREATE INDEX IF NOT EXISTS idx_white_label_domain
ON white_label_settings(custom_domain);

CREATE INDEX IF NOT EXISTS idx_white_label_active
ON white_label_settings(is_active);

-- Deployments
CREATE INDEX IF NOT EXISTS idx_deployments_org
ON deployments(organization_id);

CREATE INDEX IF NOT EXISTS idx_deployments_type
ON deployments(type);

CREATE INDEX IF NOT EXISTS idx_deployments_status
ON deployments(status);

CREATE INDEX IF NOT EXISTS idx_deployments_environment
ON deployments(environment);

CREATE INDEX IF NOT EXISTS idx_deployments_created_by
ON deployments(created_by);

-- Deployment Logs
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment
ON deployment_logs(deployment_id);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_level
ON deployment_logs(level);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_created
ON deployment_logs(created_at);

-- Provisioning Queue
CREATE INDEX IF NOT EXISTS idx_provisioning_org
ON provisioning_queue(organization_id);

CREATE INDEX IF NOT EXISTS idx_provisioning_status
ON provisioning_queue(status);

-- Organizations Extended
CREATE INDEX IF NOT EXISTS idx_org_ext_subscription
ON organizations_extended(subscription_status);

CREATE INDEX IF NOT EXISTS idx_org_ext_provisioning
ON organizations_extended(provisioning_status);

-- API Keys Extended
CREATE INDEX IF NOT EXISTS idx_api_keys_ext_org
ON api_keys_extended(organization_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_ext_user
ON api_keys_extended(user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_ext_active
ON api_keys_extended(is_active);

CREATE INDEX IF NOT EXISTS idx_api_keys_ext_prefix
ON api_keys_extended(key_prefix);

-- Credential Vault
CREATE INDEX IF NOT EXISTS idx_credential_vault_org
ON credential_vault(organization_id);

CREATE INDEX IF NOT EXISTS idx_credential_vault_provider
ON credential_vault(provider);

-- Audit Logs Extended
CREATE INDEX IF NOT EXISTS idx_audit_logs_ext_org
ON audit_logs_extended(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ext_user
ON audit_logs_extended(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ext_action
ON audit_logs_extended(action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ext_severity
ON audit_logs_extended(severity);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ext_resource
ON audit_logs_extended(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ext_created
ON audit_logs_extended(created_at);

-- Backups
CREATE INDEX IF NOT EXISTS idx_backups_org
ON backups(organization_id);

CREATE INDEX IF NOT EXISTS idx_backups_type
ON backups(type);

CREATE INDEX IF NOT EXISTS idx_backups_status
ON backups(status);

-- Monitoring Metrics
CREATE INDEX IF NOT EXISTS idx_monitoring_org
ON monitoring_metrics(organization_id);

CREATE INDEX IF NOT EXISTS idx_monitoring_type
ON monitoring_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_monitoring_recorded
ON monitoring_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_monitoring_org_type
ON monitoring_metrics(organization_id, metric_type);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_org
ON notifications(organization_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_channel
ON notifications(channel);

CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_priority
ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notifications_status
ON notifications(status);

CREATE INDEX IF NOT EXISTS idx_notifications_created
ON notifications(created_at);

-- Notification Channels
CREATE INDEX IF NOT EXISTS idx_notif_channels_org
ON notification_channels(organization_id);

CREATE INDEX IF NOT EXISTS idx_notif_channels_channel
ON notification_channels(channel);

CREATE INDEX IF NOT EXISTS idx_notif_channels_active
ON notification_channels(is_active);

-- Feature Flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_key
ON feature_flags(key);

CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled
ON feature_flags(is_enabled);

-- Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_org
ON licenses(organization_id);

CREATE INDEX IF NOT EXISTS idx_licenses_plan
ON licenses(plan);

CREATE INDEX IF NOT EXISTS idx_licenses_status
ON licenses(status);

CREATE INDEX IF NOT EXISTS idx_licenses_key
ON licenses(license_key);

-- System Health
CREATE INDEX IF NOT EXISTS idx_system_health_component
ON system_health(component);

CREATE INDEX IF NOT EXISTS idx_system_health_status
ON system_health(status);

CREATE INDEX IF NOT EXISTS idx_system_health_checked
ON system_health(checked_at);

-- Import Export Jobs
CREATE INDEX IF NOT EXISTS idx_import_export_org
ON import_export_jobs(organization_id);

CREATE INDEX IF NOT EXISTS idx_import_export_type
ON import_export_jobs(type);

CREATE INDEX IF NOT EXISTS idx_import_export_entity
ON import_export_jobs(entity_type);

CREATE INDEX IF NOT EXISTS idx_import_export_status
ON import_export_jobs(status);

CREATE INDEX IF NOT EXISTS idx_import_export_created_by
ON import_export_jobs(created_by);

-- PWA Subscriptions
CREATE INDEX IF NOT EXISTS idx_pwa_org
ON pwa_subscriptions(organization_id);

CREATE INDEX IF NOT EXISTS idx_pwa_user
ON pwa_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_pwa_endpoint
ON pwa_subscriptions(endpoint);

-- ===========================================
-- TRIGGERS FOR updated_at
-- ===========================================

CREATE TRIGGER update_white_label_settings_updated_at
BEFORE UPDATE ON white_label_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at
BEFORE UPDATE ON deployments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_ext_updated_at
BEFORE UPDATE ON organizations_extended
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_ext_updated_at
BEFORE UPDATE ON api_keys_extended
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credential_vault_updated_at
BEFORE UPDATE ON credential_vault
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_channels_updated_at
BEFORE UPDATE ON notification_channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
BEFORE UPDATE ON licenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_export_jobs_updated_at
BEFORE UPDATE ON import_export_jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- END OF FILE
-- ===========================================
