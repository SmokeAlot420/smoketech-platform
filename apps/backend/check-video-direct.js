/**
 * Check video operation status using direct REST API
 */

const https = require('https');

async function checkVideoDirectly() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  // Latest operation from our test
  const operationName = 'models/veo-3.0-fast-generate-001/operations/vk8te9iabo9o';

  console.log('🎬 Checking video operation:', operationName);
  console.log('Using direct REST API...\n');

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/${operationName}?key=${apiKey}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Response:', JSON.stringify(result, null, 2));

          if (result.done) {
            console.log('\n✅ Video is ready!');
            if (result.response?.generatedVideos?.[0]?.video) {
              console.log('Video data available');
              console.log('Keys:', Object.keys(result.response.generatedVideos[0].video));
            }
          } else {
            console.log('\n⏳ Video is still processing...');
            console.log('Check again in a minute');
          }

          resolve(result);
        } catch (e) {
          console.error('Parse error:', e);
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.end();
  });
}

checkVideoDirectly().catch(console.error);