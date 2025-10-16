const Replicate = require('replicate');
require('dotenv').config();

async function testCheapModel() {
  console.log('\n🔍 Testing with a very cheap model\n');

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // Test with a very cheap text model
    console.log('Testing with meta/llama-2-7b-chat (very cheap text model)...');

    const output = await replicate.run(
      "meta/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0",
      {
        input: {
          prompt: "Say hello",
          max_new_tokens: 10
        }
      }
    );

    console.log('✅ API Connection successful!');
    console.log('Output:', output);

  } catch (error) {
    console.error('❌ API Error:', error.message);

    // Try to get account info
    try {
      console.log('\nChecking account status...');
      const response = await fetch('https://api.replicate.com/v1/account', {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Account info:', data);
    } catch (e) {
      console.error('Could not fetch account info:', e.message);
    }
  }
}

testCheapModel();