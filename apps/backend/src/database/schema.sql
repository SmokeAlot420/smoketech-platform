-- Viral Content Generation System Database Schema
-- PostgreSQL Schema for Future Migration
-- This schema is prepared for when you're ready to scale beyond file storage

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- Main content storage table
CREATE TABLE IF NOT EXISTS viral_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id VARCHAR(255) UNIQUE NOT NULL,
  persona_id VARCHAR(255) NOT NULL,
  series_id VARCHAR(255) NOT NULL,

  -- JSON fields for flexible data storage
  script JSONB NOT NULL,
  media_urls JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  priority VARCHAR(20) DEFAULT 'normal',
  attempts INTEGER DEFAULT 0,

  -- Timestamps
  scheduled_for TIMESTAMP,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Performance metrics
  viral_score DECIMAL(5,2),
  view_count BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,2),

  -- Constraints
  CONSTRAINT status_check CHECK (status IN ('queued', 'processing', 'published', 'failed')),
  CONSTRAINT priority_check CHECK (priority IN ('high', 'normal', 'low'))
);

-- Indexes for performance
CREATE INDEX idx_content_status ON viral_content(status);
CREATE INDEX idx_content_persona ON viral_content(persona_id);
CREATE INDEX idx_content_series ON viral_content(series_id);
CREATE INDEX idx_content_scheduled ON viral_content(scheduled_for);
CREATE INDEX idx_content_generated ON viral_content(generated_at DESC);
CREATE INDEX idx_content_viral_score ON viral_content(viral_score DESC);
CREATE INDEX idx_content_metadata ON viral_content USING GIN (metadata);
CREATE INDEX idx_content_script ON viral_content USING GIN (script);

-- Content queue table (separate for better performance)
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES viral_content(id) ON DELETE CASCADE,
  priority VARCHAR(20) DEFAULT 'normal',
  scheduled_for TIMESTAMP,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  worker_id VARCHAR(255),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  CONSTRAINT queue_priority_check CHECK (priority IN ('high', 'normal', 'low'))
);

-- Indexes for queue management
CREATE INDEX idx_queue_priority ON content_queue(priority, scheduled_for);
CREATE INDEX idx_queue_scheduled ON content_queue(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_queue_processing ON content_queue(processing_started_at) WHERE processing_completed_at IS NULL;

-- Personas table
CREATE TABLE IF NOT EXISTS personas (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  style TEXT,
  tone VARCHAR(100),
  topics TEXT[],
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Series table
CREATE TABLE IF NOT EXISTS viral_series (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  theme TEXT,
  hook TEXT,
  format VARCHAR(50),
  templates JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Model usage tracking table
CREATE TABLE IF NOT EXISTS model_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES viral_content(id) ON DELETE CASCADE,
  model_name VARCHAR(255) NOT NULL,
  model_version VARCHAR(100),
  operation_type VARCHAR(50) NOT NULL, -- 'image_generation', 'video_generation', 'text_generation'

  -- Cost tracking
  cost DECIMAL(10,4) NOT NULL,
  tokens_used INTEGER,

  -- Performance metrics
  latency_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Additional metadata
  request_params JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}'
);

-- Indexes for model usage analytics
CREATE INDEX idx_model_usage_model ON model_usage(model_name, model_version);
CREATE INDEX idx_model_usage_content ON model_usage(content_id);
CREATE INDEX idx_model_usage_timestamp ON model_usage(started_at DESC);
CREATE INDEX idx_model_usage_cost ON model_usage(cost DESC);

-- Platform distribution tracking
CREATE TABLE IF NOT EXISTS platform_distribution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES viral_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'tiktok', 'instagram', 'youtube'
  platform_post_id VARCHAR(255),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  published_at TIMESTAMP,

  -- Metrics (updated periodically)
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,2),

  -- Metadata
  post_url TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metrics_updated_at TIMESTAMP,

  CONSTRAINT platform_check CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'twitter', 'facebook'))
);

-- Indexes for platform analytics
CREATE INDEX idx_platform_dist_content ON platform_distribution(content_id);
CREATE INDEX idx_platform_dist_platform ON platform_distribution(platform, status);
CREATE INDEX idx_platform_dist_published ON platform_distribution(published_at DESC);
CREATE INDEX idx_platform_dist_engagement ON platform_distribution(engagement_rate DESC);

-- Character consistency tracking
CREATE TABLE IF NOT EXISTS characters (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reference_images TEXT[],
  style_prompt TEXT,
  usage_count INTEGER DEFAULT 0,
  consistency_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link characters to content
CREATE TABLE IF NOT EXISTS content_characters (
  content_id UUID REFERENCES viral_content(id) ON DELETE CASCADE,
  character_id VARCHAR(255) REFERENCES characters(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, character_id)
);

-- Storage metadata table (for hybrid storage tracking)
CREATE TABLE IF NOT EXISTS storage_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES viral_content(id) ON DELETE CASCADE,
  storage_type VARCHAR(50) NOT NULL, -- 'file', 'cloud', 'cdn'
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  checksum VARCHAR(64), -- SHA-256 hash
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT storage_type_check CHECK (storage_type IN ('file', 'cloud', 'cdn'))
);

-- Create index for storage lookups
CREATE INDEX idx_storage_content ON storage_metadata(content_id);
CREATE INDEX idx_storage_type ON storage_metadata(storage_type);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all relevant tables
CREATE TRIGGER update_viral_content_updated_at BEFORE UPDATE ON viral_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viral_series_updated_at BEFORE UPDATE ON viral_series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_distribution_updated_at BEFORE UPDATE ON platform_distribution
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW v_content_performance AS
SELECT
  vc.content_id,
  vc.persona_id,
  vc.series_id,
  vc.status,
  vc.viral_score,
  vc.generated_at,
  COUNT(DISTINCT pd.platform) as platforms_distributed,
  SUM(pd.views) as total_views,
  SUM(pd.likes) as total_likes,
  SUM(pd.shares) as total_shares,
  AVG(pd.engagement_rate) as avg_engagement_rate
FROM viral_content vc
LEFT JOIN platform_distribution pd ON vc.id = pd.content_id
GROUP BY vc.id, vc.content_id, vc.persona_id, vc.series_id, vc.status, vc.viral_score, vc.generated_at;

-- View for model cost analysis
CREATE OR REPLACE VIEW v_model_costs AS
SELECT
  model_name,
  model_version,
  operation_type,
  COUNT(*) as usage_count,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost,
  AVG(latency_ms) as avg_latency_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate,
  DATE_TRUNC('day', started_at) as usage_date
FROM model_usage
GROUP BY model_name, model_version, operation_type, DATE_TRUNC('day', started_at)
ORDER BY usage_date DESC, total_cost DESC;

-- Function to get next item from queue
CREATE OR REPLACE FUNCTION get_next_from_queue(p_worker_id VARCHAR(255))
RETURNS TABLE (
  queue_id UUID,
  content_id UUID,
  priority VARCHAR(20)
) AS $$
DECLARE
  v_queue_id UUID;
  v_content_id UUID;
  v_priority VARCHAR(20);
BEGIN
  -- Lock and get the next available item
  SELECT q.id, q.content_id, q.priority
  INTO v_queue_id, v_content_id, v_priority
  FROM content_queue q
  WHERE q.processing_started_at IS NULL
    AND (q.scheduled_for IS NULL OR q.scheduled_for <= NOW())
    AND q.retry_count < q.max_retries
  ORDER BY
    CASE q.priority
      WHEN 'high' THEN 1
      WHEN 'normal' THEN 2
      WHEN 'low' THEN 3
    END,
    q.scheduled_for ASC NULLS FIRST,
    q.added_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Mark as processing if found
  IF v_queue_id IS NOT NULL THEN
    UPDATE content_queue
    SET processing_started_at = NOW(),
        worker_id = p_worker_id
    WHERE id = v_queue_id;

    RETURN QUERY SELECT v_queue_id, v_content_id, v_priority;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate viral score
CREATE OR REPLACE FUNCTION calculate_viral_score(
  p_views BIGINT,
  p_likes BIGINT,
  p_comments BIGINT,
  p_shares BIGINT,
  p_hours_since_publish NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_engagement_rate NUMERIC;
  v_velocity_score NUMERIC;
  v_viral_score NUMERIC;
BEGIN
  -- Calculate engagement rate
  IF p_views > 0 THEN
    v_engagement_rate := ((p_likes + p_comments + p_shares)::NUMERIC / p_views) * 100;
  ELSE
    v_engagement_rate := 0;
  END IF;

  -- Calculate velocity score (views per hour, capped at 100)
  IF p_hours_since_publish > 0 THEN
    v_velocity_score := LEAST((p_views::NUMERIC / p_hours_since_publish) / 1000, 100);
  ELSE
    v_velocity_score := 0;
  END IF;

  -- Calculate viral score (weighted average)
  v_viral_score := (
    (p_views::NUMERIC / 10000) * 30 + -- View count (30% weight)
    v_engagement_rate * 30 + -- Engagement rate (30% weight)
    (p_shares::NUMERIC / p_views * 100) * 20 + -- Share ratio (20% weight)
    v_velocity_score * 20 -- First-hour velocity (20% weight)
  );

  -- Cap at 100
  RETURN LEAST(v_viral_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your user setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;