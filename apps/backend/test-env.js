require('dotenv').config();

console.log('REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN);
console.log('Token exists:', !!process.env.REPLICATE_API_TOKEN);
console.log('Token length:', process.env.REPLICATE_API_TOKEN ? process.env.REPLICATE_API_TOKEN.length : 0);

// Check if it's the actual token
if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_API_TOKEN.startsWith('r8_')) {
  console.log('✅ Valid Replicate API token detected!');
} else {
  console.log('❌ Invalid or missing Replicate API token');
}