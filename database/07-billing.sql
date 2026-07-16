-- ===========================================
-- AI Automation Platform
-- File: 07-billing.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- SUBSCRIPTION PLANS
-- ===========================================

CREATE TABLE IF NOT EXISTS subscription_plans (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    plan_name TEXT UNIQUE NOT NULL,

    description TEXT,

    monthly_price NUMERIC(10,2) DEFAULT 0,

    yearly_price NUMERIC(10,2) DEFAULT 0,

    currency TEXT DEFAULT 'USD',

    max_users INTEGER DEFAULT 5,

    max_ai_employees INTEGER DEFAULT 2,

    max_workflows INTEGER DEFAULT 10,

    max_storage_gb INTEGER DEFAULT 5,

    api_requests_per_month INTEGER DEFAULT 10000,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- ORGANIZATION SUBSCRIPTIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS subscriptions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    plan_id UUID
    REFERENCES subscription_plans(id)
    ON DELETE SET NULL,

    billing_cycle TEXT DEFAULT 'monthly',

    status TEXT DEFAULT 'active',

    start_date DATE,

    end_date DATE,

    auto_renew BOOLEAN DEFAULT TRUE,

    stripe_customer_id TEXT,

    stripe_subscription_id TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INVOICES
-- ===========================================

CREATE TABLE IF NOT EXISTS invoices (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    subscription_id UUID
    REFERENCES subscriptions(id)
    ON DELETE SET NULL,

    invoice_number TEXT UNIQUE,

    amount NUMERIC(10,2),

    tax NUMERIC(10,2) DEFAULT 0,

    discount NUMERIC(10,2) DEFAULT 0,

    total_amount NUMERIC(10,2),

    currency TEXT DEFAULT 'USD',

    due_date DATE,

    paid_date DATE,

    status TEXT DEFAULT 'pending',

    pdf_url TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PAYMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS payments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    invoice_id UUID
    REFERENCES invoices(id)
    ON DELETE CASCADE,

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    payment_provider TEXT,

    transaction_id TEXT,

    payment_method TEXT,

    amount NUMERIC(10,2),

    currency TEXT DEFAULT 'USD',

    payment_status TEXT DEFAULT 'pending',

    paid_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- COUPONS
-- ===========================================

CREATE TABLE IF NOT EXISTS coupons (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    coupon_code TEXT UNIQUE,

    description TEXT,

    discount_type TEXT,

    discount_value NUMERIC(10,2),

    max_usage INTEGER,

    used_count INTEGER DEFAULT 0,

    expires_at TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- COUPON USAGE
-- ===========================================

CREATE TABLE IF NOT EXISTS coupon_usage (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    coupon_id UUID
    REFERENCES coupons(id)
    ON DELETE CASCADE,

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    invoice_id UUID
    REFERENCES invoices(id)
    ON DELETE CASCADE,

    used_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- USAGE TRACKING
-- ===========================================

CREATE TABLE IF NOT EXISTS usage_tracking (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    month TEXT,

    users_count INTEGER DEFAULT 0,

    ai_employees_count INTEGER DEFAULT 0,

    workflows_count INTEGER DEFAULT 0,

    api_requests INTEGER DEFAULT 0,

    storage_used_mb INTEGER DEFAULT 0,

    total_tokens INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- BILLING EVENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS billing_events (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    event_type TEXT,

    provider TEXT,

    payload JSONB,

    status TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_subscription_org
ON subscriptions(organization_id);

CREATE INDEX IF NOT EXISTS idx_invoice_org
ON invoices(organization_id);

CREATE INDEX IF NOT EXISTS idx_payment_org
ON payments(organization_id);

CREATE INDEX IF NOT EXISTS idx_usage_org
ON usage_tracking(organization_id);

-- ===========================================
-- DEFAULT PLANS
-- ===========================================

INSERT INTO subscription_plans (

plan_name,
description,
monthly_price,
yearly_price,
max_users,
max_ai_employees,
max_workflows,
max_storage_gb,
api_requests_per_month

)

VALUES

('Free',
'Starter Plan',
0,
0,
2,
1,
5,
2,
5000),

('Starter',
'Small Business',
49,
490,
5,
3,
25,
10,
50000),

('Professional',
'Growing Business',
149,
1490,
25,
15,
100,
100,
500000),

('Enterprise',
'Unlimited',
499,
4990,
9999,
9999,
9999,
9999,
99999999)

ON CONFLICT(plan_name) DO NOTHING;

-- ===========================================
-- END OF FILE
-- ===========================================