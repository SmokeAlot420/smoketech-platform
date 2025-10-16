-- Create operations table for persistent operation tracking
-- This survives Next.js hot-reloads and server restarts

CREATE TABLE IF NOT EXISTS operations (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'complete', 'error')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  message TEXT NOT NULL,
  result JSONB,
  error TEXT,
  metadata JSONB,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_updated_at ON operations(updated_at);

-- Auto-cleanup function for operations older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_old_operations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM operations
  WHERE updated_at < EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE operations IS 'Stores video generation operation status for real-time progress tracking';
COMMENT ON COLUMN operations.id IS 'Unique operation identifier (UUID)';
COMMENT ON COLUMN operations.status IS 'Current operation status: pending, processing, complete, error';
COMMENT ON COLUMN operations.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN operations.message IS 'Human-readable status message';
COMMENT ON COLUMN operations.result IS 'Operation result data (videos, metadata, etc.)';
COMMENT ON COLUMN operations.error IS 'Error message if status is error';
COMMENT ON COLUMN operations.metadata IS 'Additional metadata (cost estimates, model info, etc.)';
COMMENT ON COLUMN operations.created_at IS 'Unix timestamp (milliseconds) when operation was created';
COMMENT ON COLUMN operations.updated_at IS 'Unix timestamp (milliseconds) when operation was last updated';
