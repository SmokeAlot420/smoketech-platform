/**
 * CREATE QUOTEMOTO INFLUENCER V2 - Using Imagen 3.0
 * Using the REAL enhanced model: imagen-3.0-generate-001
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');

// Your project configuration
const PROJECT_ID = 'viral-ai-content-12345';
const LOCATION = 'us-central1';

async function createQuoteMotoInfluencerV2() {
  console.log('\n🎨 CREATING QUOTEMOTO INFLUENCER V2 - WITH IMAGEN 3.0\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Initialize Google Auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      throw new Error('Failed to get access token');
    }

    console.log('✅ Authentication successful');
    console.log('🚀 Using imagen-3.0-generate-001 (Enhanced Imagen 3)\n');

    // Create output directory
    const outputDir = path.join(process.cwd(), 'quotemoto-influencer-v2');
    await fs.mkdir(outputDir, { recursive: true });

    // Using the REAL Imagen 3.0 endpoint
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

    // Professional prompts for QuoteMoto influencer
    const influencerPrompts = [
      {
        name: "professional_headshot",
        prompt: "Beautiful Latina woman entrepreneur, 25 years old, professional headshot portrait, confident smile, long flowing dark hair with subtle waves, warm brown eyes, natural professional makeup, wearing a sleek navy blue blazer, white background, studio lighting, motivational speaker energy, ultra high quality, photorealistic, 8K resolution"
      },
      {
        name: "tech_presentation",
        prompt: "Professional Latina businesswoman, 25 years old, standing confidently holding a tablet showing QuoteMoto app interface, modern tech office background with glass walls, enthusiastic expression, long dark wavy hair, fitted business dress, natural lighting, tech influencer style, photorealistic"
      },
      {
        name: "motivational_stage",
        prompt: "Confident Latina woman speaker, 25 years old, on stage with microphone, passionate hand gestures, professional red dress, long dark wavy hair flowing, spotlight lighting, blurred audience in background, TED talk style, motivational energy, photorealistic"
      },
      {
        name: "social_media_content",
        prompt: "Stylish Latina influencer, 25 years old, recording video content with ring light visible, modern home office setup, casual chic outfit, long dark wavy hair, warm smile, holding smartphone, lifestyle influencer vibe, natural lighting, photorealistic"
      },
      {
        name: "business_meeting",
        prompt: "Professional Latina executive, 25 years old, in modern conference room, leading a presentation, confident posture, elegant business attire, long dark wavy hair in professional style, pointing at screen showing QuoteMoto metrics, photorealistic"
      }
    ];

    const generatedImages = [];
    let referenceImageData = null;

    for (let i = 0; i < influencerPrompts.length; i++) {
      const { name, prompt } = influencerPrompts[i];

      console.log(`🎬 Generating: ${name}`);
      console.log(`   Using: imagen-3.0-generate-001`);
      console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

      const request = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: i === 0 ? "1:1" : "16:9", // Square for headshot, wide for others
          modelVersion: "imagen-3.0-generate-001",
          safetyFilterLevel: "block_some",
          personGeneration: "allow_adult"
        }
      };

      // If we have a reference image, add it for consistency
      if (referenceImageData && i > 0) {
        // For subsequent images, reference the first one
        request.instances[0].referenceImages = [{
          referenceType: "REFERENCE_TYPE_SUBJECT",
          referenceId: 1,
          referenceImage: {
            bytesBase64Encoded: referenceImageData
          },
          subjectImageConfig: {
            subjectType: "SUBJECT_TYPE_PERSON",
            subjectDescription: "Latina businesswoman influencer"
          }
        }];
        request.instances[0].prompt = request.instances[0].prompt.replace('Latina woman', 'the Latina woman [1]');
        console.log(`   📎 Using reference image for consistency`);
      }

      try {
        const response = await axios.post(endpoint, request, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.predictions && response.data.predictions.length > 0) {
          const imageData = response.data.predictions[0].bytesBase64Encoded;
          const imageBuffer = Buffer.from(imageData, 'base64');

          const imagePath = path.join(outputDir, `quotemoto_v2_${name}.png`);
          await fs.writeFile(imagePath, imageBuffer);

          console.log(`   ✅ Saved: ${imagePath}`);

          // Save the first image as reference
          if (i === 0) {
            referenceImageData = imageData;

            // Save character reference
            const refData = {
              id: `quotemoto_influencer_v2`,
              name: "Isabella Rodriguez",
              description: "Professional Latina tech entrepreneur and motivational speaker, 25 years old, long dark wavy hair, warm brown eyes, confident and approachable",
              referenceImage: imageData,
              createdAt: new Date().toISOString(),
              brand: "QuoteMoto",
              style: "Professional, tech-savvy, motivational",
              model: "imagen-3.0-generate-001"
            };

            const refPath = path.join(outputDir, 'character_reference_v2.json');
            await fs.writeFile(refPath, JSON.stringify(refData, null, 2));
            console.log(`   💾 Character reference saved\n`);

            generatedImages.push({
              name: name,
              base64: imageData,
              path: imagePath
            });
          }
        } else {
          console.log(`   ⚠️ No image generated\n`);
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.error?.message || error.message}\n`);
      }

      // Rate limiting - wait 30 seconds between requests
      if (i < influencerPrompts.length - 1) {
        console.log('   ⏳ Waiting 30 seconds for rate limit...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }

    console.log('=' .repeat(60));
    console.log('\n✅ QUOTEMOTO INFLUENCER V2 CREATED!\n');
    console.log('Model Used: imagen-3.0-generate-001 (Imagen 3.0)');
    console.log('Influencer Name: Isabella Rodriguez');
    console.log('Brand: QuoteMoto');
    console.log('Style: Professional Latina tech entrepreneur & motivational speaker');
    console.log(`Images saved to: ${outputDir}`);
    console.log('\n🎯 This uses the ENHANCED Imagen 3.0 model for better quality!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }
}

// Run the creation
console.log('🔑 Using credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
createQuoteMotoInfluencerV2();