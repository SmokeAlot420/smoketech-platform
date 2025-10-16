/**
 * CREATE QUOTEMOTO INFLUENCER - Latina Tech Influencer
 * Using the REAL NanoBanana (imagegeneration@006) endpoint
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');

// Your project configuration
const PROJECT_ID = 'viral-ai-content-12345';
const LOCATION = 'us-central1';

async function createQuoteMotoInfluencer() {
  console.log('\n🎨 CREATING QUOTEMOTO INFLUENCER\n');
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

    console.log('✅ Authentication successful\n');

    // Create output directory
    const outputDir = path.join(process.cwd(), 'quotemoto-influencer');
    await fs.mkdir(outputDir, { recursive: true });

    // Step 1: Generate the base influencer image
    console.log('📸 Generating QuoteMoto Latina influencer...\n');

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;

    // Professional prompts for a tech/motivational influencer
    const influencerPrompts = [
      {
        name: "professional_headshot",
        prompt: "Beautiful Latina woman, 25 years old, professional headshot, confident smile, long dark wavy hair, warm brown eyes, perfect makeup, wearing elegant business attire, studio lighting, motivational speaker vibe, high quality photography, 4K, ultra detailed"
      },
      {
        name: "holding_phone",
        prompt: "Beautiful Latina businesswoman, 25 years old, holding latest iPhone, showing screen to camera, enthusiastic expression, long dark wavy hair, modern office background, natural lighting, tech influencer style, professional photography"
      },
      {
        name: "motivational_speaking",
        prompt: "Confident Latina woman, 25 years old, speaking passionately, hand gestures, professional blazer, long dark wavy hair, blurred conference room background, motivational speaker energy, warm smile, professional photography"
      },
      {
        name: "casual_lifestyle",
        prompt: "Stylish Latina woman, 25 years old, casual chic outfit, working on laptop at modern cafe, long dark wavy hair, natural makeup, lifestyle influencer vibe, warm ambient lighting, candid but professional"
      }
    ];

    const generatedImages = [];

    for (let i = 0; i < influencerPrompts.length; i++) {
      const { name, prompt } = influencerPrompts[i];

      console.log(`🎬 Generating: ${name}`);
      console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

      const request = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "block_few",
          personGeneration: "allow_adult"
        }
      };

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

          const imagePath = path.join(outputDir, `quotemoto_${name}.png`);
          await fs.writeFile(imagePath, imageBuffer);

          console.log(`   ✅ Saved: ${imagePath}`);

          // Save the first image as reference for consistency
          if (i === 0) {
            generatedImages.push({
              name: name,
              base64: imageData,
              path: imagePath
            });

            // Save character reference
            const refData = {
              id: `quotemoto_latina_influencer`,
              name: "Sofia Martinez",
              description: "Beautiful Latina tech and motivational influencer, 25 years old, long dark wavy hair, warm brown eyes, professional",
              referenceImage: imageData,
              createdAt: new Date().toISOString(),
              brand: "QuoteMoto",
              style: "Professional, motivational, tech-savvy"
            };

            const refPath = path.join(outputDir, 'character_reference.json');
            await fs.writeFile(refPath, JSON.stringify(refData, null, 2));
            console.log(`   💾 Character reference saved\n`);
          }
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

    // Step 2: Generate consistent variations using the reference
    if (generatedImages.length > 0) {
      console.log('\n' + '=' .repeat(60));
      console.log('\n📸 GENERATING CONSISTENT VARIATIONS\n');

      const consistencyEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-capability-001:predict`;

      const consistentScenes = [
        "The Latina influencer [1] giving a motivational speech on stage, TED talk style, confident pose",
        "The Latina influencer [1] recording a video for social media, ring light visible, modern home office",
        "The Latina influencer [1] at a tech conference, networking, holding QuoteMoto branded materials"
      ];

      for (let i = 0; i < consistentScenes.length; i++) {
        console.log(`🎬 Generating consistent scene ${i + 1}`);

        const consistencyRequest = {
          instances: [{
            prompt: consistentScenes[i],
            referenceImages: [{
              referenceType: "REFERENCE_TYPE_SUBJECT",
              referenceId: 1,
              referenceImage: {
                bytesBase64Encoded: generatedImages[0].base64
              },
              subjectImageConfig: {
                subjectType: "SUBJECT_TYPE_PERSON",
                subjectDescription: "Latina woman influencer"
              }
            }]
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            safetyFilterLevel: "block_few",
            personGeneration: "allow_adult"
          }
        };

        try {
          const response = await axios.post(consistencyEndpoint, consistencyRequest, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.data.predictions && response.data.predictions.length > 0) {
            const imageBuffer = Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64');
            const scenePath = path.join(outputDir, `quotemoto_consistent_scene_${i + 1}.png`);
            await fs.writeFile(scenePath, imageBuffer);
            console.log(`   ✅ Saved: ${scenePath}\n`);
          }

        } catch (error) {
          if (error.response?.status === 404) {
            console.log('   ⚠️ imagen-3.0-capability-001 not available for character consistency\n');
          } else {
            console.log(`   ❌ Error: ${error.response?.data?.error?.message || error.message}\n`);
          }
        }

        // Rate limiting
        if (i < consistentScenes.length - 1) {
          console.log('   ⏳ Waiting 30 seconds for rate limit...\n');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
    }

    console.log('=' .repeat(60));
    console.log('\n✅ QUOTEMOTO INFLUENCER CREATED!\n');
    console.log('Influencer Name: Sofia Martinez');
    console.log('Brand: QuoteMoto');
    console.log('Style: Professional Latina tech & motivational influencer');
    console.log(`Images saved to: ${outputDir}`);
    console.log('\nYou can now use the character_reference.json for consistent content generation!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }
}

// Run the creation
console.log('🔑 Using credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
createQuoteMotoInfluencer();