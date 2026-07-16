-- ============================================
-- AI Automation Platform
-- 01-organizations.sql
-- Version: 2.0
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Table: industries
-- ============================================

CREATE TABLE IF NOT EXISTS industries (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    industry_name TEXT UNIQUE NOT NULL,

    description TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ============================================
-- Seed Industries
-- ============================================

INSERT INTO industries (industry_name, description)
VALUES
('General Business','Default business module'),
('Real Estate','Real estate agencies'),
('Healthcare','Clinics and hospitals'),
('Legal','Law firms'),
('Restaurant','Restaurants and cafes'),
('Construction','Construction companies'),
('Accounting','Accounting firms'),
('Finance','Financial services'),
('Education','Schools and institutes'),
('Travel','Travel agencies'),
('Insurance','Insurance companies'),
('Logistics','Transport and logistics'),
('Manufacturing','Manufacturing companies'),
('Automotive','Automotive businesses'),
('Fitness','Gyms and fitness centers'),
('Beauty','Beauty salons'),
('Hotel','Hotels and resorts'),
('Recruitment','Recruitment agencies'),
('Marketing','Marketing agencies'),
('E-commerce','Online stores')
ON CONFLICT (industry_name) DO NOTHING;

-- ============================================
-- Table: organizations
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_name TEXT NOT NULL,

    slug TEXT UNIQUE NOT NULL,

    industry_id UUID REFERENCES industries(id),

    company_email TEXT,

    company_phone TEXT,

    company_website TEXT,

    company_logo TEXT,

    address TEXT,

    city TEXT,

    state TEXT,

    country TEXT,

    timezone TEXT DEFAULT 'UTC',

    currency TEXT DEFAULT 'USD',

    subscription_plan TEXT DEFAULT 'Free',

    subscription_status TEXT DEFAULT 'Active',

    max_users INTEGER DEFAULT 5,

    max_ai_employees INTEGER DEFAULT 2,

    max_workflows INTEGER DEFAULT 10,

    storage_limit_mb INTEGER DEFAULT 1024,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ============================================
-- Table: organization_settings
-- ============================================

CREATE TABLE IF NOT EXISTS organization_settings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    language TEXT DEFAULT 'en',

    date_format TEXT DEFAULT 'YYYY-MM-DD',

    time_format TEXT DEFAULT '24h',

    ai_provider TEXT DEFAULT 'Gemini',

    ai_model TEXT DEFAULT 'gemini-2.5-pro',

    email_notifications BOOLEAN DEFAULT TRUE,

    whatsapp_notifications BOOLEAN DEFAULT TRUE,

    sms_notifications BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_org_slug
ON organizations(slug);

CREATE INDEX IF NOT EXISTS idx_org_industry
ON organizations(industry_id);

CREATE INDEX IF NOT EXISTS idx_org_active
ON organizations(is_active);

CREATE INDEX IF NOT EXISTS idx_settings_org
ON organization_settings(organization_id);

-- ============================================
-- END OF FILE
-- ============================================