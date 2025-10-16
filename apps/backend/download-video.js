/**
 * Download the generated video from Google's API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function downloadVideo() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  // Video URI from the API response
  const videoUri = 'https://generativelanguage.googleapis.com/v1beta/files/mt4chrilgkc8:download?alt=media';

  console.log('📥 Downloading video from Google API...');
  console.log('URI:', videoUri);
  console.log('');

  const outputDir = path.join(process.cwd(), 'generated');
  const fileName = `veo3-golden-retriever-${Date.now()}.mp4`;
  const filePath = path.join(outputDir, fileName);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download the video
  const file = fs.createWriteStream(filePath);

  // Add API key to the URL
  const downloadUrl = `${videoUri}&key=${apiKey}`;

  https.get(downloadUrl, (response) => {
    console.log('Response status:', response.statusCode);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Length:', response.headers['content-length']);

    if (response.statusCode === 200) {
      let totalBytes = 0;
      const contentLength = parseInt(response.headers['content-length'] || '0');

      response.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (contentLength > 0) {
          const progress = Math.round((totalBytes / contentLength) * 100);
          process.stdout.write(`\rDownloading... ${progress}% (${Math.round(totalBytes / 1024)}KB)`);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\n\n✅ VIDEO DOWNLOADED SUCCESSFULLY!');
        console.log(`📁 Location: ${path.resolve(filePath)}`);
        console.log(`📊 Size: ${Math.round(totalBytes / 1024 / 1024)}MB`);
        console.log('\n🎬 Open this file to watch your AI-generated video:');
        console.log(path.resolve(filePath));
      });
    } else if (response.statusCode === 302 || response.statusCode === 301) {
      // Handle redirect
      console.log('Redirect to:', response.headers.location);
      https.get(response.headers.location, handleResponse);
    } else {
      console.error(`\n❌ Download failed with status: ${response.statusCode}`);

      // Read the error response
      let errorData = '';
      response.on('data', (chunk) => {
        errorData += chunk;
      });
      response.on('end', () => {
        console.error('Error response:', errorData);
      });
    }
  }).on('error', (err) => {
    console.error('Download error:', err.message);
  });
}

downloadVideo().catch(console.error);