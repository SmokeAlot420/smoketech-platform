import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service, VEO3JSONPrompt } from '../src/services/veo3Service';
import * as path from 'path';

/**
 * Estimating Tutorial Demo - 8 Second Video
 *
 * Shows professional painter demonstrating digital estimating workflow:
 * - Digital takeoffs (blueprints/photos)
 * - Price calculators
 * - Templates and margin checks
 *
 * Uses existing character image for consistency
 */

interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
}

function logProgress(stage: string, progress: number, message: string) {
  const update: ProgressUpdate = { stage, progress, message };
  console.log('PROGRESS:' + JSON.stringify(update));
}

async function generateEstimatingTutorial() {
  try {
    console.log('💼 Estimating Tutorial Generator');
    console.log('================================================================================\n');

    // Use existing painter character image for consistency
    const painterImagePath = 'generated/vertex-ai/nanoBanana/professional_painting_contractor_35_years_old_ma_1759293456805.png';

    logProgress('character', 20, 'Using existing painter character for consistency');
    console.log(`📸 Character image: ${painterImagePath}\n`);

    // Stage: Generate 8-Second Estimating Tutorial Video
    logProgress('video', 40, 'Generating estimating tutorial video...');

    const veo3 = new VEO3Service();

    // ✅ 2025 JSON PROMPTING - 300%+ quality improvement with timing structure
    const videoPromptJSON: VEO3JSONPrompt = {
      prompt: "Professional painting contractor demonstrates digital estimating workflow at office computer. PRESERVE: Exact facial features from reference image. Natural realistic movement.",
      negative_prompt: "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, poor quality, distorted face, inconsistent features, screen glare, harsh lighting",

      // 🔥 TIMING STRUCTURE - CRITICAL for 300%+ quality boost!
      timing: {
        "0-2s": "Master painter at desk introduces topic: 'Let me show you digital estimating'",
        "2-6s": "Pointing at computer screen showing takeoff software, calculators, and blueprint tools",
        "6-8s": "Concludes confidently: 'Accurate estimates, better margins guaranteed'"
      },

      config: {
        duration_seconds: 8,
        aspect_ratio: "9:16",
        resolution: "1080p",

        camera: {
          motion: "stable over-shoulder shot showing both contractor and screen",
          angle: "slightly elevated angle capturing desk and screen",
          lens_type: "35mm for environmental context",
          position: "positioned behind and to side of contractor showing screen clearly"
        },

        lighting: {
          mood: "professional office lighting",
          time_of_day: "daytime office hours",
          consistency: "professional quality, well-lit workspace",
          enhancement: "natural office lighting without harsh shadows"
        },

        character: {
          description: "Master painter in navy company polo, professional and knowledgeable",
          action: "explaining digital estimating software while gesturing to computer screen",
          preservation: "maintain exact facial features and professional appearance from reference image",
          movement_quality: "natural professional gestures pointing at screen elements, confident explanatory body language"
        },

        environment: {
          location: "professional office with desk and computer workstation",
          atmosphere: "modern professional office environment with visible technology",
          spatial_awareness: "natural interaction with computer and workspace",
          interaction_elements: ["computer/laptop screen", "desk surface", "office chair", "professional workspace"]
        },

        audio: {
          primary: "Let me show you digital estimating. See - takeoff software measures from blueprints and photos, price calculators with our templates, automatic margin checks. Accurate estimates, better margins guaranteed.",
          ambient: ["quiet office ambience", "subtle keyboard sounds", "professional workspace tone"],
          quality: "professional recording quality",
          lip_sync: "precise mouth movement matching speech",
          dialogue_timing: "natural pacing synchronized with visual timing structure and screen gestures"
        },

        technical: {
          skin_realism: "natural skin texture with subtle imperfections and realistic appearance",
          movement_physics: "natural human movement with realistic physics, authentic gesturing toward screen",
          environmental_integration: "seamless integration with office environment, realistic screen interaction",
          quality_target: "broadcast-quality professional tutorial video"
        }
      }
    };

    logProgress('video', 50, 'Sending request to VEO3...');

    const videoResult = await veo3.generateVideoSegment({
      prompt: videoPromptJSON, // ✅ Pass COMPLETE JSON object for 300%+ quality!
      duration: 8,
      aspectRatio: '9:16', // Vertical for social media
      firstFrame: painterImagePath, // Character consistency!
      quality: 'high',
      enableSoundGeneration: true
    });

    if (!videoResult.success || !videoResult.videos.length) {
      throw new Error('Failed to generate video: ' + videoResult.error);
    }

    logProgress('complete', 100, 'Estimating tutorial generation complete');

    const finalVideoPath = videoResult.videos[0];
    const cost = 0.00 + (videoResult.metadata?.cost || 6.00); // No character generation cost

    // Output final result as JSON for omega-service to parse
    const result = {
      success: true,
      videoPath: finalVideoPath,
      characterImagePath: painterImagePath,
      duration: 8,
      format: '9:16 vertical',
      cost: cost,
      timestamp: new Date().toISOString()
    };

    console.log('RESULT:' + JSON.stringify(result));

    console.log('\n🎉 Estimating Tutorial Complete!');
    console.log('================================================================================');
    console.log(`📁 Video: ${finalVideoPath}`);
    console.log(`📱 Format: Vertical 9:16 - TikTok/Instagram ready`);
    console.log(`⏱️  Duration: 8 seconds`);
    console.log(`💰 Total Cost: $${cost.toFixed(2)}`);
    console.log('\n🎯 Demo shows: Digital estimating workflow');
    console.log('📊 Perfect for teaching customers about your tech-enabled process\n');

  } catch (error) {
    console.error('\n❌ Tutorial generation failed:', error);
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    console.log('RESULT:' + JSON.stringify(errorResult));
    process.exit(1);
  }
}

// Run the generator
generateEstimatingTutorial();
