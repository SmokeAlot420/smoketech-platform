import dotenv from 'dotenv';
dotenv.config();

import { VertexAINanoBananaService } from '../src/services/vertexAINanoBanana';
import { VEO3Service, VEO3JSONPrompt } from '../src/services/veo3Service';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Painting Company SOP Demo - 8 Second Video
 *
 * Generates a professional painting contractor demonstrating
 * proper surface prep technique (the #1 critical SOP step)
 *
 * Output: 8-second vertical video (9:16) for social media
 */

interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
}

function logProgress(stage: string, progress: number, message: string) {
  const progressData: GenerationProgress = { stage, progress, message };
  console.log(`PROGRESS:${JSON.stringify(progressData)}`);
}

async function generatePaintingSOPDemo() {
  console.log('🎨 Painting Company SOP Demo Generator');
  console.log('='.repeat(80));

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY required');
    process.exit(1);
  }

  try {
    // Stage 1: Generate Professional Painter Character
    logProgress('character', 10, 'Generating professional painter character...');

    const nanoBanana = new VertexAINanoBananaService();

    const painterPrompt = `Professional painting contractor, 35 years old, male, experienced and trustworthy appearance.

NATURAL REALISM:
- Natural skin texture
- Authentic work-worn hands
- Professional demeanor
- Confident expert presence

OUTFIT: Navy blue company polo shirt, khaki work pants, professional work appearance

SETTING: At job site, standing near wall that needs prep, proper job site lighting

EXPRESSION: Confident, expert, teaching pose - addressing camera directly

POSE: Front-facing professional stance, ready to demonstrate technique

PRESERVE: Exact facial features for video consistency`;

    logProgress('character', 15, 'Sending request to NanoBanana...');

    const imageResults = await nanoBanana.generateImage(painterPrompt, {
      temperature: 0.3,
      numImages: 1
    });

    if (!imageResults || imageResults.length === 0) {
      throw new Error('Failed to generate painter character');
    }

    const painterImagePath = imageResults[0].imagePath;
    logProgress('character', 30, `Character generated: ${painterImagePath}`);

    // Stage 2: Generate 8-Second SOP Demo Video
    logProgress('video', 40, 'Generating surface prep demonstration video...');

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

    logProgress('video', 50, 'Sending request to VEO3...');

    const videoResult = await veo3.generateVideoSegment({
      prompt: videoPromptJSON, // ✅ Pass COMPLETE JSON object for 300%+ quality!
      duration: 8,
      aspectRatio: '9:16', // Vertical for social media
      firstFrame: painterImagePath,
      quality: 'high',
      enableSoundGeneration: true
    });

    if (!videoResult.success || !videoResult.videos.length) {
      throw new Error('Failed to generate video: ' + videoResult.error);
    }

    const finalVideoPath = videoResult.videos[0].videoPath;

    logProgress('complete', 100, 'Video generation complete');

    // Output final result as JSON for omega-service to parse
    const result = {
      success: true,
      videoPath: finalVideoPath,
      characterImagePath: painterImagePath,
      duration: 8,
      format: '9:16 vertical',
      cost: 0.02 + (videoResult.metadata?.cost || 6.00),
      timestamp: new Date().toISOString()
    };

    console.log('RESULT:' + JSON.stringify(result));

    console.log('\n🎉 Painting SOP Demo Complete!');
    console.log('='.repeat(80));
    console.log(`📁 Video: ${finalVideoPath}`);
    console.log(`📱 Format: Vertical 9:16 - TikTok/Instagram ready`);
    console.log(`⏱️  Duration: 8 seconds`);
    console.log(`💰 Total Cost: $${result.cost.toFixed(2)}`);
    console.log('\n🎯 Demo shows: Surface prep - the #1 SOP step');
    console.log('📊 Perfect for teaching customers WHY your process matters');

  } catch (error) {
    console.error('\n❌ Demo generation failed:', error);
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    console.log('RESULT:' + JSON.stringify(errorResult));
    process.exit(1);
  }
}

// Run it
generatePaintingSOPDemo().catch(console.error);
