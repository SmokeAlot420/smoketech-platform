// Test VEO3 Service Account Authentication
// This verifies VEO3 is using Auturf's $1,000 Vertex AI credits

import dotenv from 'dotenv';
dotenv.config();

import { GoogleAuth } from 'google-auth-library';

async function testVEO3Authentication() {
  console.log('🔍 Testing VEO3 Authentication Setup...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`  GCP_PROJECT_ID: ${process.env.GCP_PROJECT_ID}`);
  console.log(`  GCP_LOCATION: ${process.env.GCP_LOCATION}`);
  console.log(`  GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}\n`);

  // Verify service account file
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFilePath) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not set!');
    process.exit(1);
  }

  try {
    // Read service account to show project
    const fs = await import('fs');
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

    console.log('🔑 Service Account Details:');
    console.log(`  Project ID: ${serviceAccount.project_id}`);
    console.log(`  Client Email: ${serviceAccount.client_email}`);
    console.log(`  Account Type: ${serviceAccount.type}\n`);

    // Verify it's the correct account
    if (serviceAccount.project_id === 'viral-ai-content-12345') {
      console.log('✅ CORRECT! Using Auturf\'s account with $1,000 credits\n');
    } else {
      console.error('❌ WRONG ACCOUNT! This is not the $1,000 credits account!');
      process.exit(1);
    }

    // Test authentication
    console.log('🔐 Testing Google Auth...');
    const auth = new GoogleAuth({
      keyFilename: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();

    if (tokenResponse.token) {
      console.log('✅ Successfully obtained access token');
      console.log(`  Token length: ${tokenResponse.token.length} characters`);
      console.log(`  Token starts with: ${tokenResponse.token.substring(0, 20)}...`);
    } else {
      console.error('❌ Failed to get access token');
      process.exit(1);
    }

    // Get project info from authenticated client
    const projectId = await auth.getProjectId();
    console.log(`\n✅ Authenticated Project: ${projectId}`);

    if (projectId === 'viral-ai-content-12345') {
      console.log('\n🎉 SUCCESS! VEO3 will use the $1,000 Vertex AI credits!');
      console.log('   Account: auturf46@gmail.com');
      console.log('   Project: viral-ai-content-12345');
      console.log('   Credits: $1,000 for VEO3 video generation\n');
    } else {
      console.error('\n❌ ERROR! Wrong project authenticated!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  }
}

testVEO3Authentication().catch(console.error);
