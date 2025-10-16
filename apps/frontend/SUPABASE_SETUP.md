# Supabase Setup for Persistent Operation Store

## Problem We're Solving

The in-memory operation store gets cleared during Next.js hot-reloads, causing 404 errors when the frontend polls for operation status. **Supabase provides persistent database storage** that survives:
- Hot-reloads during development
- Server restarts
- Application deployments

## Quick Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: omega-platform (or your choice)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait ~2 minutes for project to provision

### 2. Get Your API Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - click "Reveal" button)

### 3. Add Environment Variables

Add these to your `.env` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**IMPORTANT**: Use the **service_role key** for `SUPABASE_SERVICE_KEY` (NOT the anon key). The service role key has full database access needed for server-side operations.

### 4. Run Database Migration

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the contents of `supabase/migrations/001_create_operations_table.sql` into the editor
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

**Alternatively**, copy-paste this SQL directly:

```sql
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

-- Indexes for faster queries
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
```

### 5. Verify Setup

1. In Supabase dashboard, click "Table Editor"
2. You should see the "operations" table listed
3. The table should have these columns:
   - id (text, primary key)
   - status (text)
   - progress (integer)
   - message (text)
   - result (jsonb)
   - error (text)
   - metadata (jsonb)
   - created_at (bigint)
   - updated_at (bigint)

### 6. Restart Your Dev Server

```bash
# Stop the dev server (Ctrl+C if running)
# Then restart:
npm run dev
```

You should see this in the console:
```
✅ OperationStore using Supabase (persistent storage)
```

Instead of:
```
⚠️  OperationStore using in-memory Map (not persistent across hot-reloads)
```

## Testing the Setup

1. Generate a video through the UI
2. While it's generating, make a code change to trigger a hot-reload
3. The operation should still be trackable in the database
4. Video generation should complete successfully
5. Success dialog should appear with the video

## Troubleshooting

### "OperationStore using in-memory Map" Warning

**Cause**: Environment variables not loaded or incorrect

**Fix**:
1. Check `.env` file exists in project root
2. Verify all three variables are set (URL, anon key, service key)
3. Restart dev server
4. Check for typos in variable names

### "Table does not exist" Error

**Cause**: Migration not run

**Fix**:
1. Go to Supabase SQL Editor
2. Run the migration SQL from step 4
3. Verify table exists in Table Editor

### Connection Errors

**Cause**: Incorrect credentials or network issues

**Fix**:
1. Verify Project URL matches your Supabase project
2. Verify you're using the **service_role key** (not anon key)
3. Check your internet connection
4. Verify Supabase project is active (not paused)

### 404s Still Happening

**Cause**: Using anon key instead of service_role key

**Fix**:
1. Double-check you copied the **service_role key** (requires revealing)
2. Update `.env` with correct key
3. Restart dev server

## Production Deployment

For production environments:

1. **Never commit** `.env` to git (already in .gitignore)
2. **Add environment variables** to your hosting platform:
   - Vercel: Project Settings > Environment Variables
   - Netlify: Site Settings > Build & Deploy > Environment
   - Railway: Variables tab
3. **Use service_role key** for production (server-side only)
4. **Enable Row Level Security (RLS)** in Supabase if exposing to clients
5. **Set up automatic cleanup**:
   ```sql
   -- Schedule cleanup function to run every hour
   SELECT cron.schedule(
     'cleanup-old-operations',
     '0 * * * *',  -- Every hour
     'SELECT cleanup_old_operations();'
   );
   ```

## Cost Information

- **Free tier**: 500MB database, 2GB file storage, 50,000 monthly active users
- **Operations table**: Each operation ~1-5KB depending on result size
- **Storage estimate**: 1 million operations ≈ 5GB
- **Recommended**: Enable auto-cleanup to stay within free tier

## Security Notes

- ✅ Service role key is server-side only (never exposed to client)
- ✅ Operations table stores temporary data (auto-deleted after 1 hour)
- ✅ No sensitive user data stored
- ⚠️ If exposing operations to frontend, enable Row Level Security (RLS)

## Next Steps

Once setup is complete:
1. Test video generation end-to-end
2. Verify operations persist across hot-reloads
3. Check Supabase Table Editor to see operations being created
4. Monitor for any errors in console or Supabase logs

---

**Need help?** Check the Supabase docs: https://supabase.com/docs
