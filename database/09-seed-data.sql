-- ===========================================
-- AI Automation Platform
-- File: 09-seed-data.sql
-- Version: 2.0
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- DEFAULT ORGANIZATION
-- ===========================================

INSERT INTO organizations (

organization_name,
slug,
company_email,
company_website,
country,
timezone,
subscription_plan

)

VALUES

(

'Demo Organization',
'demo-org',
'admin@example.com',
'https://example.com',
'United Arab Emirates',
'Asia/Dubai',
'Enterprise'

)

ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- DEFAULT CRM PIPELINES
-- ===========================================

CREATE TABLE IF NOT EXISTS crm_pipelines (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
    REFERENCES organizations(id)
    ON DELETE CASCADE,

    pipeline_name TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

INSERT INTO crm_pipelines (

organization_id,
pipeline_name

)

SELECT

id,
'Default Sales Pipeline'

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

-- ===========================================
-- DEFAULT LEAD STAGES
-- ===========================================

CREATE TABLE IF NOT EXISTS crm_stages (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pipeline_id UUID
    REFERENCES crm_pipelines(id)
    ON DELETE CASCADE,

    stage_name TEXT,

    sort_order INTEGER

);

INSERT INTO crm_stages (

pipeline_id,
stage_name,
sort_order

)

SELECT

id,
'New Lead',
1

FROM crm_pipelines

UNION ALL

SELECT

id,
'Qualified',
2

FROM crm_pipelines

UNION ALL

SELECT

id,
'Proposal',
3

FROM crm_pipelines

UNION ALL

SELECT

id,
'Negotiation',
4

FROM crm_pipelines

UNION ALL

SELECT

id,
'Won',
5

FROM crm_pipelines

UNION ALL

SELECT

id,
'Lost',
6

FROM crm_pipelines;

-- ===========================================
-- DEFAULT AI EMPLOYEES
-- ===========================================

INSERT INTO ai_employees (

organization_id,

employee_name,

employee_slug,

employee_type,

category,

description

)

SELECT

id,

'AI Sales Employee',

'ai-sales',

'Sales',

'Sales',

'Handles sales conversations'

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

INSERT INTO ai_employees (

organization_id,

employee_name,

employee_slug,

employee_type,

category,

description

)

SELECT

id,

'AI Customer Support',

'ai-support',

'Support',

'Customer Support',

'Handles customer support'

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

INSERT INTO ai_employees (

organization_id,

employee_name,

employee_slug,

employee_type,

category,

description

)

SELECT

id,

'AI Receptionist',

'ai-receptionist',

'Reception',

'Operations',

'Books appointments'

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

-- ===========================================
-- DEFAULT MARKETPLACE PRODUCTS
-- ===========================================

INSERT INTO marketplace_products (

organization_id,

product_name,

slug,

description,

industry_module,

price,

currency

)

SELECT

id,

'AI Sales Employee',

'ai-sales-employee',

'Ready-to-use AI Sales Employee',

'General',

99,

'USD'

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

INSERT INTO marketplace_products (

organization_id,

product_name,

slug,

description,

industry_module,

price,

currency

)

SELECT

id,

'AI Customer Support',

'ai-support-employee',

'Ready-to-use AI Support Employee',

'General',

79,

'USD'

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

-- ===========================================
-- DEFAULT AUTOMATION TEMPLATE
-- ===========================================

INSERT INTO automation_templates (

organization_id,

template_name,

slug,

industry_module,

workflow_type,

description,

workflow_json

)

SELECT

id,

'Lead Qualification Automation',

'lead-qualification',

'General',

'automation',

'Automatically qualifies leads',

'{}'::jsonb

FROM organizations

WHERE slug='demo-org'

ON CONFLICT DO NOTHING;

-- ===========================================
-- DEFAULT DASHBOARD METRICS
-- ===========================================

INSERT INTO dashboard_metrics (

organization_id,

metric_name,

metric_value

)

SELECT

id,

'Total Users',

0

FROM organizations

WHERE slug='demo-org';

INSERT INTO dashboard_metrics (

organization_id,

metric_name,

metric_value

)

SELECT

id,

'Total AI Employees',

3

FROM organizations

WHERE slug='demo-org';

INSERT INTO dashboard_metrics (

organization_id,

metric_name,

metric_value

)

SELECT

id,

'Total Workflows',

1

FROM organizations

WHERE slug='demo-org';

-- ===========================================
-- DEFAULT ANNOUNCEMENT
-- ===========================================

INSERT INTO announcements (

title,

message,

target_role

)

VALUES (

'Welcome',

'Welcome to AI Automation Platform',

'All'

)

ON CONFLICT DO NOTHING;

-- ===========================================
-- END OF FILE
-- ===========================================