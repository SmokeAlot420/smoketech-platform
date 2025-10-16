import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service, VEO3JSONPrompt } from '../src/services/veo3Service';
import * as path from 'path';

/**
 * Painting Company Video Trilogy Generator
 *
 * Generates 3 ultra-realistic 8-second videos with same character:
 * 1. Surface Prep SOP
 * 2. Digital Estimating
 * 3. Color Consultation
 *
 * ULTRA-REALISTIC APPROACH:
 * - Natural daylight lighting (NO professional studio look)
 * - Visible skin imperfections and texture
 * - Natural facial asymmetry and micro-expressions
 * - Realistic movement physics with breathing
 * - Environmental integration with natural shadows
 */

interface VideoConfig {
  name: string;
  description: string;
  prompt: VEO3JSONPrompt;
}

interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
}

function logProgress(stage: string, progress: number, message: string) {
  const update: ProgressUpdate = { stage, progress, message };
  console.log('PROGRESS:' + JSON.stringify(update));
}

async function generatePaintingTrilogy() {
  try {
    console.log('🎬 Painting Company Video Trilogy Generator');
    console.log('================================================================================');
    console.log('🎯 Ultra-Realistic Approach: Natural lighting, authentic skin texture, realistic movement\n');

    // Use the natural-looking character the user selected
    const characterImagePath = 'generated/vertex-ai/nanoBanana/professional_painting_contractor_35_years_old_ma_1759285050117.png';

    logProgress('setup', 5, 'Using natural-looking character for all 3 videos');
    console.log(`📸 Character: ${characterImagePath}\n`);

    const veo3 = new VEO3Service();

    // ═══════════════════════════════════════════════════════════════════════
    // VIDEO 1: SURFACE PREP SOP
    // ═══════════════════════════════════════════════════════════════════════

    const video1Prompt: VEO3JSONPrompt = {
      prompt: "Professional painting contractor demonstrates surface prep technique at job site. PRESERVE: Exact facial features from reference image. Natural realistic movement.",
      negative_prompt: "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, poor quality, distorted face, professional studio lighting, dramatic lighting, harsh lighting, perfect skin, flawless",

      timing: {
        "0-2s": "Contractor introduces: 'Surface prep is everything in painting'",
        "2-6s": "Explains workflow: power wash, scrape loose paint, fill cracks, sand smooth, prime bare spots",
        "6-8s": "Concludes confidently: 'That's why our jobs last ten plus years guaranteed'"
      },

      config: {
        duration_seconds: 8,
        aspect_ratio: "9:16",
        resolution: "1080p",

        camera: {
          motion: "stable handheld shot with subtle natural movement",
          angle: "eye-level conversational angle",
          lens_type: "35mm natural perspective",
          position: "medium shot showing contractor and job site background"
        },

        lighting: {
          mood: "natural daylight outdoor lighting",
          time_of_day: "mid-morning natural light",
          consistency: "soft natural outdoor lighting with realistic shadows",
          enhancement: "authentic natural light with subtle cloud diffusion"
        },

        character: {
          description: "Experienced painting contractor in work clothes, authentic job site appearance",
          action: "explaining surface prep technique while gesturing naturally",
          preservation: "maintain exact facial features and authentic appearance from reference image",
          movement_quality: "natural conversational body language, authentic hand gestures, subtle breathing movement",
          micro_expressions: ["natural blinking", "authentic facial asymmetry", "subtle forehead movement", "realistic eye contact variations", "natural mouth movements during speech"]
        },

        environment: {
          location: "real job site with wall that needs prep work visible in background",
          atmosphere: "authentic outdoor work environment with natural elements",
          spatial_awareness: "natural awareness of job site surroundings",
          interaction_elements: ["wall surface", "work area", "outdoor environment", "natural job site elements"]
        },

        audio: {
          primary: "Surface prep is everything in painting. Power wash first, scrape loose paint, fill any cracks, sand it smooth, then prime bare spots. That's why our jobs last ten plus years guaranteed.",
          ambient: ["outdoor ambience", "distant traffic", "light wind", "natural job site sounds"],
          quality: "natural conversational audio quality",
          lip_sync: "precise natural mouth movement matching speech rhythm",
          dialogue_timing: "natural conversational pacing with realistic pauses"
        },

        technical: {
          skin_realism: "VISIBLE skin pores and texture, natural facial asymmetry, authentic imperfections, subtle subsurface scattering, realistic skin tone variations",
          movement_physics: "natural breathing affecting torso and shoulders, realistic weight shifting, authentic gesture physics, natural head movements",
          environmental_integration: "realistic outdoor shadows on face, natural color temperature from daylight, authentic environmental reflections",
          quality_target: "ultra-photorealistic authentic job site video indistinguishable from real footage"
        }
      }
    };

    logProgress('video1', 20, 'Generating Video 1: Surface Prep SOP...');
    console.log('🎬 Starting Video 1: Surface Prep SOP\n');

    const video1Result = await veo3.generateVideoSegment({
      prompt: video1Prompt,
      duration: 8,
      aspectRatio: '9:16',
      firstFrame: characterImagePath,
      quality: 'high',
      enableSoundGeneration: true
    });

    if (!video1Result.success) {
      throw new Error('Video 1 failed: ' + video1Result.error);
    }

    const video1Path = video1Result.videos[0];
    logProgress('video1', 40, `Video 1 complete: ${video1Path}`);
    console.log(`✅ Video 1 saved: ${video1Path}\n`);

    // ═══════════════════════════════════════════════════════════════════════
    // VIDEO 2: DIGITAL ESTIMATING
    // ═══════════════════════════════════════════════════════════════════════

    const video2Prompt: VEO3JSONPrompt = {
      prompt: "Painting contractor demonstrates digital estimating at office desk with computer. PRESERVE: Exact facial features from reference image. Natural realistic movement.",
      negative_prompt: "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, poor quality, distorted face, professional studio lighting, dramatic lighting, screen glare, perfect skin, flawless",

      timing: {
        "0-2s": "Contractor introduces: 'Let me show you our digital estimating system'",
        "2-6s": "Points at screen: takeoff software measures from blueprints, calculators with templates, automatic margin checks",
        "6-8s": "Concludes: 'Accurate estimates mean better margins for us'"
      },

      config: {
        duration_seconds: 8,
        aspect_ratio: "9:16",
        resolution: "1080p",

        camera: {
          motion: "stable over-shoulder view showing contractor and computer screen",
          angle: "slightly elevated natural angle showing desk workspace",
          lens_type: "35mm natural perspective",
          position: "positioned to show both contractor and screen clearly"
        },

        lighting: {
          mood: "natural office window lighting",
          time_of_day: "daytime with natural window light",
          consistency: "soft natural indoor lighting from windows",
          enhancement: "authentic mixed lighting from windows and ambient office light"
        },

        character: {
          description: "Experienced contractor in casual work polo, authentic office setting appearance",
          action: "explaining estimating software while gesturing toward screen naturally",
          preservation: "maintain exact facial features and authentic appearance from reference image",
          movement_quality: "natural explanatory gestures toward screen, authentic conversational body language, realistic seated posture",
          micro_expressions: ["natural blinking", "authentic eye movements toward screen", "realistic thinking expressions", "natural smile variations", "subtle eyebrow movements"]
        },

        environment: {
          location: "real office with desk, computer, and natural window light",
          atmosphere: "authentic small business office environment",
          spatial_awareness: "natural interaction with desk and computer workspace",
          interaction_elements: ["computer screen", "desk surface", "office chair", "window light", "office background"]
        },

        audio: {
          primary: "Let me show you our digital estimating system. Takeoff software measures right from blueprints and photos, price calculators use our templates, automatic margin checks. Accurate estimates mean better margins for us.",
          ambient: ["quiet office ambience", "subtle computer fan", "distant office sounds", "natural room tone"],
          quality: "natural conversational audio in office setting",
          lip_sync: "precise natural mouth movement matching speech rhythm",
          dialogue_timing: "natural explanatory pacing with realistic screen-pointing pauses"
        },

        technical: {
          skin_realism: "VISIBLE skin pores and texture, natural facial asymmetry, authentic imperfections, subtle indoor lighting skin tone, realistic texture variations",
          movement_physics: "natural breathing and torso movement, realistic gesture physics, authentic head turns toward screen, natural weight shifting in chair",
          environmental_integration: "realistic window light on face, natural office color temperature, authentic screen reflection in eyes, realistic indoor shadows",
          quality_target: "ultra-photorealistic authentic office tutorial indistinguishable from real footage"
        }
      }
    };

    logProgress('video2', 50, 'Generating Video 2: Digital Estimating...');
    console.log('🎬 Starting Video 2: Digital Estimating\n');

    const video2Result = await veo3.generateVideoSegment({
      prompt: video2Prompt,
      duration: 8,
      aspectRatio: '9:16',
      firstFrame: characterImagePath,
      quality: 'high',
      enableSoundGeneration: true
    });

    if (!video2Result.success) {
      throw new Error('Video 2 failed: ' + video2Result.error);
    }

    const video2Path = video2Result.videos[0];
    logProgress('video2', 70, `Video 2 complete: ${video2Path}`);
    console.log(`✅ Video 2 saved: ${video2Path}\n`);

    // ═══════════════════════════════════════════════════════════════════════
    // VIDEO 3: COLOR CONSULTATION
    // ═══════════════════════════════════════════════════════════════════════

    const video3Prompt: VEO3JSONPrompt = {
      prompt: "Painting contractor demonstrates color consultation with paint chips and samples. PRESERVE: Exact facial features from reference image. Natural realistic movement.",
      negative_prompt: "blurry, low-resolution, cartoonish, plastic, synthetic, artificial, fake, poor quality, distorted face, professional studio lighting, dramatic lighting, harsh lighting, perfect skin, flawless",

      timing: {
        "0-2s": "Contractor introduces: 'Choosing the right color is crucial'",
        "2-6s": "Shows paint chips and samples: we bring full color palettes, test on your walls, lighting matters",
        "6-8s": "Concludes: 'You see exactly how it looks before we commit'"
      },

      config: {
        duration_seconds: 8,
        aspect_ratio: "9:16",
        resolution: "1080p",

        camera: {
          motion: "stable medium shot with natural handheld feel",
          angle: "eye-level conversational angle",
          lens_type: "35mm natural perspective",
          position: "medium shot showing contractor with paint samples"
        },

        lighting: {
          mood: "natural indoor home lighting",
          time_of_day: "daytime with natural window and room light",
          consistency: "soft natural mixed indoor lighting",
          enhancement: "authentic residential lighting with warm color temperature"
        },

        character: {
          description: "Experienced contractor in work polo, authentic client-facing appearance",
          action: "demonstrating paint chip samples while explaining color selection naturally",
          preservation: "maintain exact facial features and authentic appearance from reference image",
          movement_quality: "natural conversational body language, authentic hand gestures showing samples, realistic subtle movements",
          micro_expressions: ["natural blinking", "authentic friendly expressions", "realistic eye contact variations", "natural smile during explanation", "subtle head nods"]
        },

        environment: {
          location: "real residential interior with natural home lighting",
          atmosphere: "authentic home consultation environment",
          spatial_awareness: "natural interaction with paint samples and environment",
          interaction_elements: ["paint chip samples", "color cards", "residential background", "natural home elements"]
        },

        audio: {
          primary: "Choosing the right color is crucial for your home. We bring full color palettes, test swatches right on your walls, because lighting totally changes how colors look. You see exactly how it looks before we commit to anything.",
          ambient: ["quiet residential ambience", "subtle room tone", "natural indoor sounds"],
          quality: "natural conversational audio in residential setting",
          lip_sync: "precise natural mouth movement matching speech rhythm",
          dialogue_timing: "natural consultative pacing with realistic sample-showing pauses"
        },

        technical: {
          skin_realism: "VISIBLE skin pores and texture, natural facial asymmetry, authentic imperfections, realistic indoor lighting skin tone, subtle texture variations",
          movement_physics: "natural breathing and torso movement, realistic gesture physics with paint samples, authentic natural movements, realistic weight shifting",
          environmental_integration: "realistic residential lighting on face, natural warm color temperature, authentic home environment shadows, realistic color card reflections",
          quality_target: "ultra-photorealistic authentic color consultation indistinguishable from real footage"
        }
      }
    };

    logProgress('video3', 80, 'Generating Video 3: Color Consultation...');
    console.log('🎬 Starting Video 3: Color Consultation\n');

    const video3Result = await veo3.generateVideoSegment({
      prompt: video3Prompt,
      duration: 8,
      aspectRatio: '9:16',
      firstFrame: characterImagePath,
      quality: 'high',
      enableSoundGeneration: true
    });

    if (!video3Result.success) {
      throw new Error('Video 3 failed: ' + video3Result.error);
    }

    const video3Path = video3Result.videos[0];
    logProgress('video3', 95, `Video 3 complete: ${video3Path}`);
    console.log(`✅ Video 3 saved: ${video3Path}\n`);

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════════════════

    logProgress('complete', 100, 'All 3 videos generated successfully!');

    const totalCost = 18.00; // 3 videos × $6.00 each

    const result = {
      success: true,
      videos: [
        { name: "Surface Prep SOP", path: video1Path, topic: "Surface preparation workflow" },
        { name: "Digital Estimating", path: video2Path, topic: "Digital takeoff and pricing" },
        { name: "Color Consultation", path: video3Path, topic: "Color selection process" }
      ],
      characterImage: characterImagePath,
      duration: 8,
      format: "9:16 vertical",
      totalCost: totalCost,
      timestamp: new Date().toISOString()
    };

    console.log('RESULT:' + JSON.stringify(result));

    console.log('\n🎉 TRILOGY COMPLETE!');
    console.log('================================================================================');
    console.log('📽️  Video 1: Surface Prep SOP');
    console.log(`   ${video1Path}`);
    console.log('📽️  Video 2: Digital Estimating');
    console.log(`   ${video2Path}`);
    console.log('📽️  Video 3: Color Consultation');
    console.log(`   ${video3Path}`);
    console.log('\n📱 Format: Vertical 9:16 - TikTok/Instagram ready');
    console.log('⏱️  Duration: 8 seconds each');
    console.log(`💰 Total Cost: $${totalCost.toFixed(2)}`);
    console.log('\n✨ Ultra-Realistic Features Applied:');
    console.log('   • Natural daylight/window lighting (NO studio look)');
    console.log('   • Visible skin pores and realistic texture');
    console.log('   • Natural facial asymmetry and micro-expressions');
    console.log('   • Realistic breathing and movement physics');
    console.log('   • Authentic environmental integration');
    console.log('   • Same character across all 3 videos\n');

  } catch (error) {
    console.error('\n❌ Trilogy generation failed:', error);
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
generatePaintingTrilogy();
