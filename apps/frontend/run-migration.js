/**
 * Run Supabase migration to create operations table
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrationSQL = `
-- Create operations table for persistent operation tracking
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
`;

async function runMigration() {
  console.log('🚀 Running Supabase migration...');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct query instead
      console.log('⚠️  exec_sql RPC not available, trying direct queries...');

      // Split and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.startsWith('COMMENT ON')) {
          // Skip comments for now as they might fail
          continue;
        }

        const { error: stmtError } = await supabase.rpc('query', { sql: statement });
        if (stmtError) {
          console.error(`❌ Error executing statement:`, stmtError);
          // Continue with other statements
        }
      }

      console.log('✅ Migration completed (some statements may have been skipped)');
    } else {
      console.log('✅ Migration completed successfully');
    }

    // Verify table was created
    const { data: tables, error: verifyError } = await supabase
      .from('operations')
      .select('count')
      .limit(0);

    if (verifyError) {
      console.error('❌ Table verification failed:', verifyError.message);
      console.log('\n⚠️  Please run the migration SQL manually in Supabase SQL Editor:');
      console.log('   1. Go to https://supabase.com/dashboard/project/xevuihfnvbvjzkrfjxmv/sql/new');
      console.log('   2. Copy the SQL from: supabase/migrations/001_create_operations_table.sql');
      console.log('   3. Click "Run" to execute the migration\n');
    } else {
      console.log('✅ Table verified: operations table exists and is accessible');
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n⚠️  Please run the migration SQL manually in Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard/project/xevuihfnvbvjzkrfjxmv/sql/new');
    console.log('   2. Copy the SQL from: supabase/migrations/001_create_operations_table.sql');
    console.log('   3. Click "Run" to execute the migration\n');
  }
}

runMigration();
