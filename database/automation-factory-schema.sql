-- ============================================
-- AI Automation Factory — Database Schema
-- ============================================
-- Supabase SQL Editor mein run karo. pgvector extension enable karta hai
-- taake hum "similarity search" kar sakein (client ki requirement ko
-- existing templates se match karne ke liye).

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Table 1: Templates (tumhare saare ready-made automations)
-- ============================================
CREATE TABLE automation_templates (
  id SERIAL PRIMARY KEY,
  template_name TEXT NOT NULL,
  industry TEXT NOT NULL,              -- real-estate, restaurant, dental, etc.
  use_case TEXT NOT NULL,               -- "lead qualification", "table booking", etc.
  description TEXT NOT NULL,            -- client-facing description
  workflow_json JSONB NOT NULL,         -- poora n8n workflow JSON yahan store hota hai
  embedding VECTOR(1536),               -- OpenAI text-embedding-3-small ka output size
  times_used INT DEFAULT 0,
  status TEXT DEFAULT 'active',         -- active | draft | deprecated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX ON automation_templates USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- Table 2: Client Requests (har naya request track hota hai)
-- ============================================
CREATE TABLE automation_requests (
  id SERIAL PRIMARY KEY,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  requirement_text TEXT NOT NULL,        -- client ne jo type kiya
  embedding VECTOR(1536),
  matched_template_id INT REFERENCES automation_templates(id),
  match_score FLOAT,                     -- 0 to 1, kitna similar tha
  status TEXT DEFAULT 'pending',         -- pending | auto_matched | needs_building | in_review | delivered | rejected
  generated_workflow_json JSONB,         -- agar naya banaya gaya to yahan store hota hai (review se pehle)
  deployed_workflow_id TEXT,             -- n8n mein deploy hone ke baad uska ID
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Function: Match requirement against existing templates
-- ============================================
CREATE OR REPLACE FUNCTION match_templates(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.85,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id INT,
  template_name TEXT,
  industry TEXT,
  use_case TEXT,
  workflow_json JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.template_name,
    t.industry,
    t.use_case,
    t.workflow_json,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM automation_templates t
  WHERE t.status = 'active'
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- Seed: Insert your existing 11 real-estate workflows as the first templates
-- (Run this AFTER you generate embeddings for each — see docs/embedding-setup.md)
-- ============================================
-- INSERT INTO automation_templates (template_name, industry, use_case, description, workflow_json)
-- VALUES ('AI Real Estate Sales Employee', 'real-estate', 'lead qualification + sales',
--   'AI employee that captures, qualifies, and follows up on property leads', '{...paste workflow JSON...}');
