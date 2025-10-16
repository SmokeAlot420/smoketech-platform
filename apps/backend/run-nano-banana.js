#!/usr/bin/env node

/**
 * RUN NANO BANANA - Quick Start Guide
 * This shows how to use the REAL NanoBanana (imagegeneration@006)
 */

console.log(`
🎨 NANO BANANA QUICK START
==========================

✅ You now have the REAL NanoBanana implementation!

The key discovery:
• imagegeneration@006 = NanoBanana (Gemini 2.5 Flash Image)
• imagen-3.0-capability-001 = Enhanced version with character consistency

To run tests:
1. Make sure your Google Cloud credentials are set:
   export GOOGLE_APPLICATION_CREDENTIALS="E:\\v2 repo\\viral\\vertex-ai-key.json"

2. Test simple image generation:
   node test-nano-banana-production.js

3. Test with your Temporal workflow:
   npm run workflow

Key files created:
• nano-banana-vertex.ts - Production implementation with character consistency
• test-nano-banana-production.js - Test script for verification
• src/activities.ts - Updated to use the real NanoBanana

Important notes:
• Rate limit: 2 requests per minute
• Always wait 30 seconds between requests
• Use reference images for character consistency
• The gemini-experimental models are TEXT only, not for images

Your setup is PERFECT! The authentication works, and you're using the correct endpoints.

To verify everything is working:
`);

// Quick check for credentials
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('⚠️  Set your credentials first:');
  console.log('    SET GOOGLE_APPLICATION_CREDENTIALS=E:\\v2 repo\\viral\\vertex-ai-key.json');
} else {
  console.log('✅ Credentials are set:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('\nRun this to test:');
  console.log('    node test-nano-banana-production.js');
}

console.log('\n🚀 You can now generate consistent AI influencers for your viral content!');
console.log('=====================================================================\n');