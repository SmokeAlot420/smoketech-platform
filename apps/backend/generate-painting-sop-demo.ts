import dotenv from 'dotenv';
dotenv.config();

import { VertexAINanoBananaService } from './src/services/vertexAINanoBanana';
import { VEO3Service, VEO3JSONPrompt } from './src/services/veo3Service';

/**
 * Painting Company SOP Demo Video
 *
 * 8-second ultra-realistic video showing a painting contractor
 * demonstrating surface prep - the #1 critical SOP step
 */

async function generatePaintingSOPDemo() {
  console.log('🎨 Painting Company SOP Demo Generator');
  console.log('=' .repeat(80));

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY required');
    return;
  }

  try {
    // Stage 1: Generate Character (Master Painting Contractor)
    console.log('\n📸 Generating Master Painter character...');

    const nanoBanana = new VertexAINanoBananaService();

    const painterPrompt = `Professional painting contractor, 35 years old, male, experienced and trustworthy appearance.

NATURAL REALISM:
- Natural skin texture
- Authentic work-worn hands
- Professional demeanor
- Confident expert presence

OUTFIT: Company polo shirt (navy blue), khaki work pants, professional appearance

SETTING: At job site, prepping wall surface, proper lighting

EXPRESSION: Confident, expert, teaching viewers

POSE: Three-quarter view demonstrating wall prep technique

PRESERVE: Exact facial features for brand consistency`;

    const imageResults = await nanoBanana.generateImage(painterPrompt, {
      temperature: 0.3,
      numImages: 1
    });

    if (!imageResults || imageResults.length === 0) {
      throw new Error('Failed to generate painter character');
    }

    const painterImagePath = imageResults[0].imagePath;
    console.log(`   ✅ Master Painter generated: ${painterImagePath}`);

    // Stage 2: Generate 8-Second SOP Demo Video
    console.log('\n🎬 Generating surface prep SOP video...');

    const veo3 = new VEO3Service();

    // ✅ 2025 JSON PROMPTING - 300%+ quality improvement with timing structure
    const videoPromptJSON: VEO3JSONPrompt = {
      prompt: "Professional painting contractor demonstrates proper surface prep technique. PRESERVE: Exact facial features from reference image. Natural realistic movement.",
      negative_prompt: "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, poor quality, distorted face, inconsistent features",

      // 🔥 TIMING STRUCTURE - CRITICAL for 300%+ quality boost!
      timing: {
        "0-2s": "Master painter in navy polo introduces topic: 'Surface prep is everything'",
        "2-6s": "Demonstrates techniques: power wash, scrape, fill cracks, sand smooth",
        "6-8s": "Concludes confidently: 'That's why our jobs last 10 plus years guaranteed'"
      },

      config: {
        duration_seconds: 8,
        aspect_ratio: "9:16",
        resolution: "1080p",

        camera: {
          motion: "stable shot with slight slow zoom in for emphasis",
          angle: "eye-level",
          lens_type: "50mm",
          position: "tripod-mounted camera at chest height"
        },

        lighting: {
          mood: "natural job site lighting",
          time_of_day: "daytime",
          consistency: "professional quality, well-lit face",
          enhancement: "natural enhancement with proper exposure"
        },

        character: {
          description: "Master painter in navy company polo, professional and trustworthy",
          action: "demonstrating surface prep while explaining to camera",
          preservation: "maintain exact facial features and professional appearance throughout",
          movement_quality: "natural professional body language with confident gestures"
        },

        environment: {
          location: "job site with wall being prepped in background",
          atmosphere: "professional work environment, trustworthy setting",
          spatial_awareness: "natural navigation of work space"
        },

        audio: {
          primary: "Surface prep is everything. Watch - we power wash, scrape loose paint, fill cracks, sand smooth, then prime bare spots. That's why our jobs last 10 plus years guaranteed.",
          ambient: ["job site sounds", "light work ambience"],
          quality: "professional recording quality",
          lip_sync: "precise mouth movement matching speech",
          dialogue_timing: "natural pacing synchronized with visual timing structure"
        },

        technical: {
          skin_realism: "natural skin texture with subtle imperfections and realistic appearance",
          movement_physics: "natural human movement with realistic physics and weight",
          environmental_integration: "seamless integration with job site environment",
          quality_target: "broadcast-quality professional demonstration video"
        }
      }
    };

    const videoResult = await veo3.generateVideoSegment({
      prompt: videoPromptJSON, // ✅ Pass COMPLETE JSON object for 300%+ quality!
      duration: 8,
      aspectRatio: '9:16',
      firstFrame: painterImagePath,
      quality: 'high',
      enableSoundGeneration: true
    });

    if (!videoResult.success || !videoResult.videos.length) {
      throw new Error('Failed to generate video: ' + videoResult.error);
    }

    const finalVideoPath = videoResult.videos[0].videoPath;

    // Success!
    console.log('\n🎉 Painting SOP Demo Complete!');
    console.log('=' .repeat(80));
    console.log(`📁 Video: ${finalVideoPath}`);
    console.log(`📱 Format: Vertical 9:16 - TikTok/Instagram ready`);
    console.log(`⏱️  Duration: 8 seconds`);
    console.log(`💰 Total Cost: $${(0.02 + (videoResult.metadata?.cost || 6.00)).toFixed(2)}`);
    console.log('\n🎯 Demo shows: Surface prep - the #1 SOP step');
    console.log('📊 This video teaches customers WHY your process matters');
    console.log('\nSign off as SmokeDev 🚬');

  } catch (error) {
    console.error('\n❌ Demo generation failed:', error);
    throw error;
  }
}

// Run it
generatePaintingSOPDemo().catch(console.error);
