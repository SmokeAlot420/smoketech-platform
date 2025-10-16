/**
 * Check the actual response structure from the video operation
 */

const https = require('https');

async function checkVideoResponse() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  // Latest operation from our test
  const operationName = 'models/veo-3.0-fast-generate-001/operations/l6b6x3u3m61e';

  console.log('🔍 Checking video operation response structure...');
  console.log('Operation:', operationName);
  console.log('');

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
          console.log('Full Response:');
          console.log(JSON.stringify(result, null, 2));
          console.log('\n=====================================\n');

          // Check specific fields
          if (result.done) {
            console.log('✅ Video is done');

            // Try different response paths
            if (result.response) {
              console.log('\n📦 Response object found:');
              console.log('Keys:', Object.keys(result.response));

              if (result.response.generatedVideos) {
                console.log('Generated videos:', result.response.generatedVideos.length);
              }

              if (result.response.videos) {
                console.log('Videos:', result.response.videos.length);
              }

              if (result.response.video) {
                console.log('Video object found');
              }
            }

            if (result.metadata) {
              console.log('\n📊 Metadata found:');
              console.log(JSON.stringify(result.metadata, null, 2));
            }
          } else {
            console.log('⏳ Still processing...');
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

checkVideoResponse().catch(console.error);