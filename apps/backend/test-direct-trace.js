require('dotenv').config();
const fetch = require('node-fetch');

async function sendDirectTrace() {
  console.log('Sending trace directly to Langfuse API...\n');

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_HOST;

  console.log('Using credentials:');
  console.log('- Host:', baseUrl);
  console.log('- Public Key:', publicKey?.substring(0, 15) + '...');
  console.log('- Secret Key:', secretKey?.substring(0, 15) + '...\n');

  const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

  const traceData = {
    batch: [{
      id: `trace-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'trace-create',
      body: {
        id: `trace-${Date.now()}`,
        name: 'test-nanobanana-trace',
        userId: 'test-user',
        metadata: {
          test: true,
          model: 'imagegeneration@006',
          cost: 0.020
        },
        release: '1.0.0',
        version: '1.0.0',
        sessionId: `session-${Date.now()}`,
        public: false
      }
    }]
  };

  try {
    const response = await fetch(`${baseUrl}/api/public/ingestion`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(traceData)
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response:', responseText);

    if (response.ok) {
      console.log('\n✅ Trace sent successfully!');
      console.log('Check http://localhost:3030/project/cmfw7a7s20006q007fivzgax4/traces');
    } else {
      console.log('\n❌ Failed to send trace');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

sendDirectTrace();