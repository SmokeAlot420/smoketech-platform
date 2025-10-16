/**
 * Test Supabase connection and operations table
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Supabase connection...');
console.log(`📡 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Check if table exists by querying it
    console.log('\n📊 Test 1: Checking operations table...');
    const { data, error, count } = await supabase
      .from('operations')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('✅ Operations table exists!');
    console.log(`📋 Current operations count: ${count || 0}`);
    if (data && data.length > 0) {
      console.log(`📝 Sample operations:`, data.map(op => ({
        id: op.id.substring(0, 8) + '...',
        status: op.status,
        progress: op.progress
      })));
    }

    // Test 2: Create a test operation
    console.log('\n📝 Test 2: Creating test operation...');
    const testId = 'test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('operations')
      .insert({
        id: testId,
        status: 'pending',
        progress: 0,
        message: 'Test operation from verification script',
        created_at: Date.now(),
        updated_at: Date.now()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return;
    }

    console.log('✅ Test operation created:', insertData.id);

    // Test 3: Update the operation
    console.log('\n🔄 Test 3: Updating test operation...');
    const { data: updateData, error: updateError } = await supabase
      .from('operations')
      .update({
        status: 'complete',
        progress: 100,
        message: 'Test completed successfully',
        updated_at: Date.now()
      })
      .eq('id', testId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return;
    }

    console.log('✅ Test operation updated:', updateData.status);

    // Test 4: Read the operation
    console.log('\n📖 Test 4: Reading test operation...');
    const { data: readData, error: readError } = await supabase
      .from('operations')
      .select('*')
      .eq('id', testId)
      .single();

    if (readError) {
      console.error('❌ Read failed:', readError.message);
      return;
    }

    console.log('✅ Test operation read:', {
      id: readData.id,
      status: readData.status,
      progress: readData.progress,
      message: readData.message
    });

    // Test 5: Delete the test operation
    console.log('\n🗑️  Test 5: Cleaning up test operation...');
    const { error: deleteError } = await supabase
      .from('operations')
      .delete()
      .eq('id', testId);

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError.message);
      return;
    }

    console.log('✅ Test operation deleted');

    console.log('\n🎉 ALL TESTS PASSED! Supabase is ready to use.');
    console.log('✅ The operation store will now persist across hot-reloads!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testConnection();
