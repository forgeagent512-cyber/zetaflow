-- ===========================================
-- AI Automation Platform
-- File: 13-sprint6-seo-marketing.sql
-- Version: 2.0
-- Sprint 6: SEO Center, GEO Center, AEO Center,
-- AI Content Studio, Blog CMS, Marketing Center,
-- Keyword Research, Competitor Analysis, Schema Generator
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- 1. SEO PAGES
-- ===========================================

CREATE TABLE IF NOT EXISTS seo_pages (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    url TEXT NOT NULL,

    title TEXT,

    meta_title TEXT,

    meta_description TEXT,

    keywords TEXT[] DEFAULT '{}',

    canonical_url TEXT,

    robots_meta TEXT,

    og_title TEXT,

    og_description TEXT,

    og_image TEXT,

    twitter_card TEXT,

    twitter_title TEXT,

    twitter_description TEXT,

    twitter_image TEXT,

    hreflang_tags JSONB DEFAULT '{}',

    schema_markup JSONB DEFAULT '{}',

    is_indexed BOOLEAN DEFAULT TRUE,

    is_published BOOLEAN DEFAULT FALSE,

    seo_score NUMERIC(5,2),

    core_web_vitals JSONB DEFAULT '{}',

    recommendations JSONB DEFAULT '{}',

    last_analyzed TIMESTAMP,

    created_by UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 2. SEO REDIRECTS
-- ===========================================

CREATE TABLE IF NOT EXISTS seo_redirects (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    source_url TEXT NOT NULL,

    target_url TEXT NOT NULL,

    status_code INTEGER DEFAULT 301,

    is_active BOOLEAN DEFAULT TRUE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 3. SEO BROKEN LINKS
-- ===========================================

CREATE TABLE IF NOT EXISTS seo_broken_links (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    page_url TEXT NOT NULL,

    link_url TEXT NOT NULL,

    link_type TEXT CHECK (link_type IN ('internal','external')),

    status_code INTEGER,

    found_at TIMESTAMP DEFAULT NOW(),

    fixed_at TIMESTAMP

);

-- ===========================================
-- 4. SITEMAPS
-- ===========================================

CREATE TABLE IF NOT EXISTS sitemaps (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    filename TEXT NOT NULL,

    content TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    last_submitted TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 5. GEO ENTITIES
-- ===========================================

CREATE TABLE IF NOT EXISTS geo_entities (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    entity_type TEXT NOT NULL,

    description TEXT,

    attributes JSONB DEFAULT '{}',

    relationships JSONB DEFAULT '{}',

    context TEXT,

    knowledge_graph_id UUID,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 6. GEO KNOWLEDGE GRAPH
-- ===========================================

CREATE TABLE IF NOT EXISTS geo_knowledge_graph (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    description TEXT,

    entities JSONB DEFAULT '[]',

    relationships JSONB DEFAULT '[]',

    topics TEXT[] DEFAULT '{}',

    industries TEXT[] DEFAULT '{}',

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 7. AEO CONTENT
-- ===========================================

CREATE TABLE IF NOT EXISTS aeo_content (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    content_type TEXT NOT NULL
        CHECK (content_type IN ('faq','question','answer','how_to','comparison','glossary','definition')),

    question TEXT NOT NULL,

    answer TEXT,

    schema_markup JSONB DEFAULT '{}',

    keywords TEXT[] DEFAULT '{}',

    related_entities JSONB DEFAULT '[]',

    is_published BOOLEAN DEFAULT FALSE,

    seo_score NUMERIC(5,2),

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 8. BLOG POSTS
-- ===========================================

CREATE TABLE IF NOT EXISTS blog_posts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    title TEXT NOT NULL,

    slug TEXT NOT NULL,

    content TEXT,

    excerpt TEXT,

    author_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    category_id UUID,

    tags TEXT[] DEFAULT '{}',

    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft','scheduled','published','archived')),

    published_at TIMESTAMP,

    scheduled_at TIMESTAMP,

    seo_score NUMERIC(5,2),

    ai_suggestions JSONB DEFAULT '{}',

    meta_title TEXT,

    meta_description TEXT,

    og_image TEXT,

    featured_image TEXT,

    allow_comments BOOLEAN DEFAULT TRUE,

    view_count INTEGER DEFAULT 0,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (organization_id, slug)

);

-- ===========================================
-- 9. BLOG CATEGORIES
-- ===========================================

CREATE TABLE IF NOT EXISTS blog_categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    slug TEXT NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 10. LANDING PAGES
-- ===========================================

CREATE TABLE IF NOT EXISTS landing_pages (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    title TEXT NOT NULL,

    slug TEXT NOT NULL,

    industry TEXT,

    target_audience TEXT,

    goal TEXT,

    hero_section JSONB DEFAULT '{}',

    features_section JSONB DEFAULT '{}',

    cta_section JSONB DEFAULT '{}',

    pricing_section JSONB DEFAULT '{}',

    testimonials_section JSONB DEFAULT '{}',

    faqs_section JSONB DEFAULT '{}',

    schema_markup JSONB DEFAULT '{}',

    seo_metadata JSONB DEFAULT '{}',

    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft','published','archived')),

    is_published BOOLEAN DEFAULT FALSE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (organization_id, slug)

);

-- ===========================================
-- 11. SCHEMA MARKUPS
-- ===========================================

CREATE TABLE IF NOT EXISTS schema_markups (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    schema_type TEXT NOT NULL
        CHECK (schema_type IN ('organization','local_business','software_app','service','product','faq','how_to','review','breadcrumb','article','blog','person','video','image','event')),

    name TEXT NOT NULL,

    content JSONB NOT NULL DEFAULT '{}',

    page_url TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 12. MARKETING CAMPAIGNS
-- ===========================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    type TEXT NOT NULL
        CHECK (type IN ('email','newsletter','push','whatsapp','lead_magnet')),

    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft','sending','sent','scheduled','paused')),

    content JSONB DEFAULT '{}',

    audience JSONB DEFAULT '{}',

    schedule TIMESTAMP,

    sent_count INTEGER DEFAULT 0,

    open_count INTEGER DEFAULT 0,

    click_count INTEGER DEFAULT 0,

    conversion_count INTEGER DEFAULT 0,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 13. EMAIL TEMPLATES
-- ===========================================

CREATE TABLE IF NOT EXISTS email_templates (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    type TEXT NOT NULL
        CHECK (type IN ('sales','cold','welcome','followup','reminder','support','newsletter')),

    subject TEXT,

    preview_text TEXT,

    body_html TEXT,

    body_text TEXT,

    variables JSONB DEFAULT '[]',

    is_active BOOLEAN DEFAULT TRUE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 14. SOCIAL MEDIA POSTS
-- ===========================================

CREATE TABLE IF NOT EXISTS social_media_posts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    platform TEXT NOT NULL
        CHECK (platform IN ('linkedin','twitter','facebook','instagram','threads','reddit','medium','blog')),

    content TEXT NOT NULL,

    media_urls TEXT[] DEFAULT '{}',

    scheduled_at TIMESTAMP,

    posted_at TIMESTAMP,

    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft','scheduled','posted','failed')),

    engagement JSONB DEFAULT '{}',

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 15. VIDEO SCRIPTS
-- ===========================================

CREATE TABLE IF NOT EXISTS video_scripts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    title TEXT NOT NULL,

    platform TEXT NOT NULL
        CHECK (platform IN ('youtube','tiktok','instagram_reels','shorts','webinar','demo')),

    script_content JSONB DEFAULT '{}',

    duration_seconds INTEGER,

    target_audience TEXT,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 16. KEYWORDS
-- ===========================================

CREATE TABLE IF NOT EXISTS keywords (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    keyword TEXT NOT NULL,

    search_volume INTEGER,

    difficulty NUMERIC(5,2),

    opportunity_score NUMERIC(5,2),

    intent TEXT CHECK (intent IN ('informational','navigational','commercial','transactional')),

    competition TEXT,

    cpc NUMERIC(10,2),

    related_keywords TEXT[] DEFAULT '{}',

    questions TEXT[] DEFAULT '{}',

    long_tail_variations TEXT[] DEFAULT '{}',

    last_updated TIMESTAMP DEFAULT NOW(),

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 17. COMPETITORS
-- ===========================================

CREATE TABLE IF NOT EXISTS competitors (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    name TEXT NOT NULL,

    domain TEXT NOT NULL,

    pages_tracked TEXT[] DEFAULT '{}',

    keywords_tracked TEXT[] DEFAULT '{}',

    estimated_traffic INTEGER,

    backlinks_count INTEGER,

    content_categories JSONB DEFAULT '{}',

    strengths TEXT[] DEFAULT '{}',

    weaknesses TEXT[] DEFAULT '{}',

    recommendations JSONB DEFAULT '{}',

    last_analyzed TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 18. BACKLINKS
-- ===========================================

CREATE TABLE IF NOT EXISTS backlinks (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    source_url TEXT NOT NULL,

    target_url TEXT NOT NULL,

    domain_authority NUMERIC(5,2),

    is_follow BOOLEAN DEFAULT TRUE,

    status TEXT DEFAULT 'active'
        CHECK (status IN ('active','lost','new')),

    found_at TIMESTAMP DEFAULT NOW(),

    lost_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 19. CONTENT PIECES
-- ===========================================

CREATE TABLE IF NOT EXISTS content_pieces (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    title TEXT NOT NULL,

    type TEXT NOT NULL
        CHECK (type IN ('landing_page','blog','article','case_study','email','sales_page','product_description','knowledge_base','documentation','guide','whitepaper','press_release')),

    content JSONB DEFAULT '{}',

    industry TEXT,

    target_audience TEXT,

    seo_score NUMERIC(5,2),

    readability_score NUMERIC(5,2),

    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft','generated','published')),

    ai_generated BOOLEAN DEFAULT FALSE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- 20. LOCALIZATIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS localizations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    source_type TEXT NOT NULL,

    source_id UUID NOT NULL,

    locale TEXT NOT NULL,

    translated_content JSONB NOT NULL DEFAULT '{}',

    auto_translated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);

-- ===========================================
-- INDEXES
-- ===========================================

-- SEO Pages
CREATE INDEX IF NOT EXISTS idx_seo_pages_org
ON seo_pages(organization_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_url
ON seo_pages(url);
CREATE INDEX IF NOT EXISTS idx_seo_pages_is_published
ON seo_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_seo_pages_seo_score
ON seo_pages(seo_score);

-- SEO Redirects
CREATE INDEX IF NOT EXISTS idx_seo_redirects_org
ON seo_redirects(organization_id);
CREATE INDEX IF NOT EXISTS idx_seo_redirects_source
ON seo_redirects(source_url);
CREATE INDEX IF NOT EXISTS idx_seo_redirects_active
ON seo_redirects(is_active);

-- SEO Broken Links
CREATE INDEX IF NOT EXISTS idx_seo_broken_links_org
ON seo_broken_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_seo_broken_links_page
ON seo_broken_links(page_url);
CREATE INDEX IF NOT EXISTS idx_seo_broken_links_type
ON seo_broken_links(link_type);

-- Sitemaps
CREATE INDEX IF NOT EXISTS idx_sitemaps_org
ON sitemaps(organization_id);
CREATE INDEX IF NOT EXISTS idx_sitemaps_active
ON sitemaps(is_active);

-- GEO Entities
CREATE INDEX IF NOT EXISTS idx_geo_entities_org
ON geo_entities(organization_id);
CREATE INDEX IF NOT EXISTS idx_geo_entities_type
ON geo_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_geo_entities_knowledge_graph
ON geo_entities(knowledge_graph_id);

-- GEO Knowledge Graph
CREATE INDEX IF NOT EXISTS idx_geo_knowledge_graph_org
ON geo_knowledge_graph(organization_id);
CREATE INDEX IF NOT EXISTS idx_geo_knowledge_graph_active
ON geo_knowledge_graph(is_active);

-- GEO Knowledge Graph GIN
CREATE INDEX IF NOT EXISTS idx_geo_knowledge_graph_topics
ON geo_knowledge_graph USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_geo_knowledge_graph_industries
ON geo_knowledge_graph USING GIN(industries);

-- AEO Content
CREATE INDEX IF NOT EXISTS idx_aeo_content_org
ON aeo_content(organization_id);
CREATE INDEX IF NOT EXISTS idx_aeo_content_type
ON aeo_content(content_type);
CREATE INDEX IF NOT EXISTS idx_aeo_content_published
ON aeo_content(is_published);
CREATE INDEX IF NOT EXISTS idx_aeo_content_seo_score
ON aeo_content(seo_score);

-- Blog Posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_org
ON blog_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status
ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author
ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created
ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags
ON blog_posts USING GIN(tags);
CREATE FULLTEXT INDEX IF NOT EXISTS idx_blog_posts_fts
ON blog_posts
USING GIN(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'') || ' ' || coalesce(excerpt,'')));

-- Blog Categories
CREATE INDEX IF NOT EXISTS idx_blog_categories_org
ON blog_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug
ON blog_categories(slug);

-- Landing Pages
CREATE INDEX IF NOT EXISTS idx_landing_pages_org
ON landing_pages(organization_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug
ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status
ON landing_pages(status);
CREATE INDEX IF NOT EXISTS idx_landing_pages_industry
ON landing_pages(industry);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published
ON landing_pages(is_published);

-- Schema Markups
CREATE INDEX IF NOT EXISTS idx_schema_markups_org
ON schema_markups(organization_id);
CREATE INDEX IF NOT EXISTS idx_schema_markups_type
ON schema_markups(schema_type);
CREATE INDEX IF NOT EXISTS idx_schema_markups_active
ON schema_markups(is_active);
CREATE INDEX IF NOT EXISTS idx_schema_markups_page
ON schema_markups(page_url);

-- Marketing Campaigns
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_org
ON marketing_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type
ON marketing_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status
ON marketing_campaigns(status);

-- Email Templates
CREATE INDEX IF NOT EXISTS idx_email_templates_org
ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type
ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active
ON email_templates(is_active);

-- Social Media Posts
CREATE INDEX IF NOT EXISTS idx_social_media_posts_org
ON social_media_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform
ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status
ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled
ON social_media_posts(scheduled_at);

-- Video Scripts
CREATE INDEX IF NOT EXISTS idx_video_scripts_org
ON video_scripts(organization_id);
CREATE INDEX IF NOT EXISTS idx_video_scripts_platform
ON video_scripts(platform);

-- Keywords
CREATE INDEX IF NOT EXISTS idx_keywords_org
ON keywords(organization_id);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword
ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_intent
ON keywords(intent);
CREATE INDEX IF NOT EXISTS idx_keywords_search_volume
ON keywords(search_volume DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_opportunity
ON keywords(opportunity_score DESC);

-- Competitors
CREATE INDEX IF NOT EXISTS idx_competitors_org
ON competitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitors_domain
ON competitors(domain);

-- Backlinks
CREATE INDEX IF NOT EXISTS idx_backlinks_org
ON backlinks(organization_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_source
ON backlinks(source_url);
CREATE INDEX IF NOT EXISTS idx_backlinks_target
ON backlinks(target_url);
CREATE INDEX IF NOT EXISTS idx_backlinks_status
ON backlinks(status);
CREATE INDEX IF NOT EXISTS idx_backlinks_domain_authority
ON backlinks(domain_authority DESC);

-- Content Pieces
CREATE INDEX IF NOT EXISTS idx_content_pieces_org
ON content_pieces(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_pieces_type
ON content_pieces(type);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status
ON content_pieces(status);
CREATE INDEX IF NOT EXISTS idx_content_pieces_industry
ON content_pieces(industry);
CREATE FULLTEXT INDEX IF NOT EXISTS idx_content_pieces_fts
ON content_pieces
USING GIN(to_tsvector('english', coalesce(title,'')));

-- Localizations
CREATE INDEX IF NOT EXISTS idx_localizations_org
ON localizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_localizations_source
ON localizations(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_localizations_locale
ON localizations(locale);

-- ===========================================
-- UPDATED AT TRIGGERS
-- ===========================================

CREATE TRIGGER update_seo_pages_updated_at
    BEFORE UPDATE ON seo_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sitemaps_updated_at
    BEFORE UPDATE ON sitemaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geo_entities_updated_at
    BEFORE UPDATE ON geo_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geo_knowledge_graph_updated_at
    BEFORE UPDATE ON geo_knowledge_graph
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aeo_content_updated_at
    BEFORE UPDATE ON aeo_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
    BEFORE UPDATE ON landing_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schema_markups_updated_at
    BEFORE UPDATE ON schema_markups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
    BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_scripts_updated_at
    BEFORE UPDATE ON video_scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
    BEFORE UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pieces_updated_at
    BEFORE UPDATE ON content_pieces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_localizations_updated_at
    BEFORE UPDATE ON localizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- END OF FILE
-- ===========================================