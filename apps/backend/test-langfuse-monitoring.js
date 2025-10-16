/**
 * TEST LANGFUSE MONITORING
 * Quick test to verify cost tracking is working
 */

// First, make sure to set up Langfuse locally:
console.log(`
📊 LANGFUSE MONITORING SETUP
============================

1️⃣ Start Local Langfuse:
   Run: start-langfuse-local.bat

2️⃣ Access Langfuse UI:
   Go to: http://localhost:3030

3️⃣ First Time Setup:
   • Create an account (any email works, it's local)
   • Create a project called "QuoteMoto Viral"
   • Go to Settings > API Keys
   • Copy the keys

4️⃣ Add to .env file:
   LANGFUSE_PUBLIC_KEY=your_public_key_here
   LANGFUSE_SECRET_KEY=your_secret_key_here
   LANGFUSE_URL=http://localhost:3030

5️⃣ Test the Integration:
   npm run workflow

6️⃣ View in Langfuse:
   • Go to http://localhost:3030/traces
   • You'll see:
     - Each workflow run as a trace
     - Cost breakdown per generation
     - Success/failure rates
     - API call latencies

💰 COST TRACKING:

   Model Costs (per request):
   • imagegeneration@006: $0.020
   • imagen-3.0-generate-001: $0.040
   • Gemini Text: ~$0.0001 per 1K tokens
   • VEO3 Video: ~$0.10 per video

   Example Daily Cost:
   • 10 personas × 5 series × 2 runs = 100 generations
   • Image cost: 100 × $0.04 = $4.00
   • Text cost: 100 × $0.001 = $0.10
   • Video cost: 100 × $0.10 = $10.00
   • Total: ~$14.10/day

🎯 ROI TRACKING:

   The system tracks:
   • Cost per viral hit
   • Views per dollar spent
   • Most cost-effective personas
   • Optimal posting times

📈 OPTIMIZATION TIPS:

   1. Use imagegeneration@006 ($0.02) instead of imagen-3.0 ($0.04) for drafts
   2. Cache character references to avoid regenerating
   3. Batch similar content to reuse prompts
   4. Monitor which personas have best ROI

🔍 DEBUGGING:

   In Langfuse UI, you can:
   • Click any trace to see full details
   • View exact prompts that worked
   • See error messages and retry attempts
   • Export data for analysis

⚡ QUICK COMMANDS:

   Start Langfuse: start-langfuse-local.bat
   Stop Langfuse: docker-compose -f docker-compose.langfuse.yml down
   View Logs: docker-compose -f docker-compose.langfuse.yml logs -f

Ready to track your AI costs! 🚀
`);

// Test tracking a sample generation
async function testTracking() {
  try {
    // Import the monitor
    const { langfuseMonitor } = require('./dist/langfuse-monitor');

    // Start a test trace
    const trace = langfuseMonitor.startWorkflowTrace('test-workflow-123', {
      persona: 'Sofia Martinez',
      series: 'Motivational Monday',
      platforms: ['tiktok', 'instagram']
    });

    // Track a test image generation
    await langfuseMonitor.trackImageGeneration({
      model: 'imagen-3.0-generate-001',
      prompt: 'Test influencer image',
      characterRef: 'test_ref_123',
      success: true,
      imageCount: 1
    });

    console.log('✅ Test tracking sent to Langfuse!');
    console.log('Check http://localhost:3030 to see the trace');

    // Flush events
    await langfuseMonitor.flush();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('Make sure Langfuse is running and API keys are set in .env');
  }
}

// Uncomment to run the test
// testTracking();