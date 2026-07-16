CREATE TABLE IF NOT EXISTS workflow_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE automation_templates
ADD COLUMN IF NOT EXISTS workflow_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_workflow_import_logs_created_at
ON workflow_import_logs(created_at DESC);
