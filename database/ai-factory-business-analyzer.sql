CREATE TABLE IF NOT EXISTS business_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    request JSONB NOT NULL,
    analysis JSONB NOT NULL,
    confidence NUMERIC(5,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_analysis_org
ON business_analysis(organization_id);

CREATE INDEX IF NOT EXISTS idx_business_analysis_created_at
ON business_analysis(created_at DESC);
