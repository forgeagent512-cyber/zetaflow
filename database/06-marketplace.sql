-- ===========================================
-- AI Automation Platform
-- File: 06-marketplace.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- PRODUCT CATEGORIES
-- ===========================================

CREATE TABLE IF NOT EXISTS product_categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_name TEXT UNIQUE NOT NULL,

    description TEXT,

    icon TEXT,

    status TEXT DEFAULT 'active',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PRODUCTS
-- ===========================================

CREATE TABLE IF NOT EXISTS marketplace_products (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    category_id UUID
    REFERENCES product_categories(id)
    ON DELETE SET NULL,

    template_id UUID
    REFERENCES automation_templates(id)
    ON DELETE SET NULL,

    product_name TEXT NOT NULL,

    slug TEXT UNIQUE,

    short_description TEXT,

    description TEXT,

    thumbnail_url TEXT,

    preview_url TEXT,

    version TEXT DEFAULT '1.0',

    industry_module TEXT,

    price NUMERIC(10,2) DEFAULT 0,

    sale_price NUMERIC(10,2),

    currency TEXT DEFAULT 'USD',

    download_type TEXT DEFAULT 'automation',

    visibility TEXT DEFAULT 'public',

    status TEXT DEFAULT 'published',

    downloads INTEGER DEFAULT 0,

    installs INTEGER DEFAULT 0,

    rating NUMERIC(3,2) DEFAULT 0,

    total_reviews INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PRODUCT FEATURES
-- ===========================================

CREATE TABLE IF NOT EXISTS product_features (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID
    REFERENCES marketplace_products(id)
    ON DELETE CASCADE,

    feature_name TEXT,

    feature_value TEXT

);

-- ===========================================
-- ORDERS
-- ===========================================

CREATE TABLE IF NOT EXISTS marketplace_orders (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    order_number TEXT UNIQUE,

    total_amount NUMERIC(10,2),

    currency TEXT DEFAULT 'USD',

    payment_status TEXT DEFAULT 'pending',

    order_status TEXT DEFAULT 'pending',

    payment_provider TEXT,

    payment_reference TEXT,

    purchased_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- ORDER ITEMS
-- ===========================================

CREATE TABLE IF NOT EXISTS marketplace_order_items (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID
    REFERENCES marketplace_orders(id)
    ON DELETE CASCADE,

    product_id UUID
    REFERENCES marketplace_products(id)
    ON DELETE CASCADE,

    quantity INTEGER DEFAULT 1,

    unit_price NUMERIC(10,2),

    total_price NUMERIC(10,2)

);

-- ===========================================
-- LICENSES
-- ===========================================

CREATE TABLE IF NOT EXISTS licenses (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    product_id UUID
    REFERENCES marketplace_products(id)
    ON DELETE CASCADE,

    license_key TEXT UNIQUE,

    activation_limit INTEGER DEFAULT 1,

    activations INTEGER DEFAULT 0,

    expires_at TIMESTAMP,

    status TEXT DEFAULT 'active',

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PRODUCT REVIEWS
-- ===========================================

CREATE TABLE IF NOT EXISTS marketplace_reviews (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID
    REFERENCES marketplace_products(id)
    ON DELETE CASCADE,

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    rating INTEGER CHECK (rating >=1 AND rating <=5),

    review TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- PRODUCT TAGS
-- ===========================================

CREATE TABLE IF NOT EXISTS marketplace_tags (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tag_name TEXT UNIQUE

);

CREATE TABLE IF NOT EXISTS marketplace_product_tags (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID
    REFERENCES marketplace_products(id)
    ON DELETE CASCADE,

    tag_id UUID
    REFERENCES marketplace_tags(id)
    ON DELETE CASCADE

);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_product_category
ON marketplace_products(category_id);

CREATE INDEX IF NOT EXISTS idx_product_org
ON marketplace_products(organization_id);

CREATE INDEX IF NOT EXISTS idx_orders_org
ON marketplace_orders(organization_id);

CREATE INDEX IF NOT EXISTS idx_license_org
ON licenses(organization_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product
ON marketplace_reviews(product_id);

-- ===========================================
-- DEFAULT PRODUCT CATEGORIES
-- ===========================================

INSERT INTO product_categories
(category_name,description)

VALUES

('AI Employees','Ready-to-use AI Employees'),

('Automation Templates','Workflow Templates'),

('CRM Systems','CRM Products'),

('Sales','Sales Products'),

('Marketing','Marketing Products'),

('Customer Support','Support Products'),

('HR','Human Resources'),

('Finance','Finance'),

('Operations','Operations'),

('Integrations','Third Party Integrations'),

('Custom Solutions','Custom Built Products')

ON CONFLICT(category_name) DO NOTHING;

-- ===========================================
-- END OF FILE
-- ===========================================