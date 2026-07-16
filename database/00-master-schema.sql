-- ===========================================
-- AI Automation Platform
-- Master Database Installer
-- File: 00-master-schema.sql
-- Version: 2.0.0
-- ===========================================

-- =====================================================
-- REQUIRED EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DATABASE VERSION
-- =====================================================

CREATE TABLE IF NOT EXISTS database_version (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    version TEXT NOT NULL,

    release_name TEXT,

    installed_at TIMESTAMP DEFAULT NOW(),

    installed_by TEXT DEFAULT CURRENT_USER

);

INSERT INTO database_version (

version,
release_name

)

SELECT

'2.0.0',
'Enterprise SaaS'

WHERE NOT EXISTS (

SELECT 1 FROM database_version

);

-- =====================================================
-- GLOBAL SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    setting_key TEXT UNIQUE,

    setting_value TEXT,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

INSERT INTO system_settings

(setting_key,setting_value)

VALUES

('platform_name','AI Automation Platform'),

('platform_version','2.0.0'),

('default_ai_provider','Gemini'),

('default_currency','USD'),

('default_timezone','UTC'),

('maintenance_mode','false'),

('registration_enabled','true'),

('marketplace_enabled','true'),

('automation_factory_enabled','true'),

('ai_employees_enabled','true'),

('analytics_enabled','true')

ON CONFLICT(setting_key)

DO NOTHING;

-- =====================================================
-- COMMON TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()

RETURNS TRIGGER

LANGUAGE plpgsql

AS $$

BEGIN

NEW.updated_at = NOW();

RETURN NEW;

END;

$$;

-- =====================================================
-- INSTALLATION CHECK
-- =====================================================

DO $$

BEGIN

RAISE NOTICE '=========================================';

RAISE NOTICE 'AI Automation Platform';

RAISE NOTICE 'Enterprise Database';

RAISE NOTICE 'Version 2.0 Installed';

RAISE NOTICE '=========================================';

END $$;

-- =====================================================
-- INSTALL ORDER
-- =====================================================

/*

Run Files In This Order

01-organizations.sql

02-users-auth.sql

03-crm.sql

04-ai-employees.sql

05-automation-factory.sql

06-marketplace.sql

07-billing.sql

08-analytics.sql

09-seed-data.sql

*/

-- =====================================================
-- END OF FILE
-- =====================================================