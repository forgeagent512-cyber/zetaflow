-- ===========================================
-- AI Automation Platform
-- File: 02-users-auth.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ROLES
-- ===========================================

CREATE TABLE IF NOT EXISTS roles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_name TEXT UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PERMISSIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS permissions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    permission_name TEXT UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- USERS
-- Linked with Supabase auth.users
-- ===========================================

CREATE TABLE IF NOT EXISTS users (

    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    role_id UUID
    REFERENCES roles(id),

    full_name TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    phone TEXT,

    avatar_url TEXT,

    job_title TEXT,

    department TEXT,

    timezone TEXT DEFAULT 'UTC',

    language TEXT DEFAULT 'en',

    is_active BOOLEAN DEFAULT TRUE,

    email_verified BOOLEAN DEFAULT FALSE,

    last_login TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- USER ROLE HISTORY
-- ===========================================

CREATE TABLE IF NOT EXISTS user_roles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    role_id UUID
    REFERENCES roles(id)
    ON DELETE CASCADE,

    assigned_at TIMESTAMP DEFAULT NOW(),

    assigned_by UUID,

    is_active BOOLEAN DEFAULT TRUE

);

-- ===========================================
-- API KEYS
-- ===========================================

CREATE TABLE IF NOT EXISTS api_keys (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    api_name TEXT NOT NULL,

    api_key TEXT NOT NULL,

    provider TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- LOGIN HISTORY
-- ===========================================

CREATE TABLE IF NOT EXISTS login_history (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    login_time TIMESTAMP DEFAULT NOW(),

    logout_time TIMESTAMP,

    ip_address TEXT,

    device TEXT,

    browser TEXT,

    operating_system TEXT,

    country TEXT,

    city TEXT

);

-- ===========================================
-- USER SESSIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS user_sessions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
    REFERENCES users(id)
    ON DELETE CASCADE,

    session_token TEXT,

    refresh_token TEXT,

    expires_at TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- ROLE PERMISSIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS role_permissions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID
    REFERENCES roles(id)
    ON DELETE CASCADE,

    permission_id UUID
    REFERENCES permissions(id)
    ON DELETE CASCADE

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_users_org
ON users(organization_id);

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role_id);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_login_history_user
ON login_history(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user
ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_org
ON api_keys(organization_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_user
ON api_keys(user_id);

-- ===========================================
-- DEFAULT ROLES
-- ===========================================

INSERT INTO roles (role_name, description)
VALUES
('Super Admin','Platform Owner'),
('Organization Admin','Company Administrator'),
('Manager','Department Manager'),
('Sales','Sales Representative'),
('Support','Customer Support'),
('Marketing','Marketing Team'),
('Finance','Finance Team'),
('HR','Human Resources'),
('AI Employee','Virtual AI Employee'),
('Client','End Client')
ON CONFLICT (role_name) DO NOTHING;

-- ===========================================
-- DEFAULT PERMISSIONS
-- ===========================================

INSERT INTO permissions (permission_name, description)
VALUES
('manage_users','Manage Users'),
('manage_roles','Manage Roles'),
('manage_workflows','Manage Workflows'),
('manage_ai_employees','Manage AI Employees'),
('manage_marketplace','Manage Marketplace'),
('manage_clients','Manage Clients'),
('manage_billing','Manage Billing'),
('manage_cms','Manage CMS'),
('view_dashboard','View Dashboard'),
('manage_settings','Manage Settings')
ON CONFLICT (permission_name) DO NOTHING;

-- ===========================================
-- END OF FILE
-- ===========================================