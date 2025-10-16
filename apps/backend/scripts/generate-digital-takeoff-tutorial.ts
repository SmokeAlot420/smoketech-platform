import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service, VEO3JSONPrompt } from '../src/services/veo3Service';

/**
 * Digital Takeoff Tutorial - Screen Recording Style
 *
 * NO HUMAN - Pure software demonstration showing:
 * - Construction blueprint on screen
 * - Automated measurement tools
 * - Real-time calculations
 * - Professional estimating software interface
 *
 * ULTRA-REALISTIC TECHNIQUES APPLIED:
 * - Proper text capitalization (NO ALL CAPS - VEO3 spells them out)
 * - Careful spelling of technical terms
 * - Smooth screen animations
 * - Professional software UI aesthetics
 * - Realistic mouse/cursor movements
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

async function generateDigitalTakeoffTutorial() {
  try {
    console.log('📐 Digital Takeoff Tutorial Generator (No Human)');
    console.log('================================================================================');
    console.log('🎯 Screen Recording Style: Software interface with automated measurements\n');

    const veo3 = new VEO3Service();

    // ✅ 2025 JSON PROMPTING with ADVANCED TECHNIQUES
    const videoPromptJSON: VEO3JSONPrompt = {
      prompt: "Professional construction estimating software screen recording showing digital takeoff workflow. Clean modern interface with blueprint visible. Natural realistic screen interaction.",

      // ⚠️ CRITICAL: Proper capitalization - NO ALL CAPS (VEO3 spells them letter-by-letter)
      negative_prompt: "people, human, person, face, hands, body parts, blurry, low-resolution, cartoonish, artificial, poor quality, pixelated, messy interface, cluttered screen, unprofessional UI",

      // 🔥 TIMING STRUCTURE for screen recording tutorial
      timing: {
        "0-2s": "Construction blueprint appears on screen with software interface opening, title overlay reads 'Digital Takeoff System'",
        "2-6s": "Automated measuring tools draw lines on blueprint, calculations appear in sidebar showing square footage and material quantities, smooth cursor movements highlighting areas",
        "6-8s": "Final pricing calculator displays total estimate with text overlay 'Accurate in Seconds', professional transition fade"
      },

      config: {
        duration_seconds: 8,
        aspect_ratio: "9:16",
        resolution: "1080p",

        camera: {
          motion: "smooth screen recording with slow zoom into blueprint details",
          angle: "direct front view of computer screen interface",
          lens_type: "screen capture perspective",
          position: "centered on software interface showing full screen workspace"
        },

        lighting: {
          mood: "bright professional screen illumination",
          time_of_day: "consistent digital screen brightness",
          consistency: "uniform screen glow with authentic monitor color temperature",
          enhancement: "realistic screen brightness without harsh glare or reflections"
        },

        character: {
          description: "No human present - pure software interface and screen elements only",
          action: "automated software tools measuring blueprint with cursor movements and calculations appearing",
          preservation: "maintain clean professional software aesthetic throughout",
          movement_quality: "smooth cursor movements, natural tool selections, realistic software interactions"
        },

        environment: {
          location: "digital construction estimating software interface showing blueprint workspace",
          atmosphere: "professional modern software environment with clean UI design",
          spatial_awareness: "organized software layout with sidebar panels and main blueprint canvas",
          interaction_elements: ["construction blueprint", "measurement tools", "calculation sidebar", "pricing calculator", "text overlays", "software menus", "cursor pointer"]
        },

        audio: {
          // NOTE: No dialogue - pure ambient software sounds
          primary: "Professional software interface ambient sounds with subtle calculation chimes",
          ambient: ["soft keyboard clicks", "mouse click sounds", "subtle software notification tones", "calculation completion chimes", "professional workspace ambience"],
          quality: "crisp digital audio quality",
          lip_sync: "not applicable - no human present",
          dialogue_timing: "background ambient sounds synchronized with visual actions",
          music: "subtle professional background music - modern corporate tech style",
          sound_effects: ["measurement tool activation sound", "calculation completion chime", "interface transition whoosh"]
        },

        technical: {
          skin_realism: "not applicable - no human in video",
          movement_physics: "realistic cursor movements with natural acceleration and deceleration, smooth tool interactions, authentic software response times",
          environmental_integration: "photorealistic software interface with authentic screen glow, realistic blueprint paper texture on screen, natural software UI elements",
          quality_target: "ultra-photorealistic screen recording indistinguishable from real construction estimating software demo"
        }
      }
    };

    // ✅ TEXT OVERLAYS - Carefully spelled, proper capitalization (NO ALL CAPS!)
    console.log('\n📝 Text Overlays (Proper Spelling & Capitalization):');
    console.log('   - "Digital Takeoff System" (NOT "DIGITAL TAKEOFF SYSTEM")');
    console.log('   - "Automated Measurements" (blueprint, measurements - spelled correctly)');
    console.log('   - "Instant Pricing Calculator" (calculator spelled correctly)');
    console.log('   - "Accurate in Seconds"\n');

    logProgress('video', 30, 'Generating screen recording tutorial...');

    const videoResult = await veo3.generateVideoSegment({
      prompt: videoPromptJSON, // ✅ COMPLETE JSON with advanced techniques!
      duration: 8,
      aspectRatio: '9:16',
      quality: 'high',
      enableSoundGeneration: true
      // NO firstFrame - this is pure screen recording, no character needed
    });

    if (!videoResult.success || !videoResult.videos.length) {
      throw new Error('Failed to generate tutorial video: ' + videoResult.error);
    }

    logProgress('complete', 100, 'Digital takeoff tutorial complete');

    const videoPath = videoResult.videos[0];
    const cost = videoResult.metadata?.cost || 6.00;

    const result = {
      success: true,
      videoPath: videoPath,
      type: "screen_recording_tutorial",
      noHuman: true,
      duration: 8,
      format: '9:16 vertical',
      cost: cost,
      textOverlays: [
        "Digital Takeoff System",
        "Automated Measurements",
        "Instant Pricing Calculator",
        "Accurate in Seconds"
      ],
      techniquesApplied: [
        "Proper text capitalization (no ALL CAPS)",
        "Careful spelling of technical terms",
        "Smooth screen animations",
        "Professional UI aesthetics",
        "Realistic cursor movements",
        "VEO3 auto-applied fixDialogueCapsLock",
        "VEO3 auto-applied enforceDialogueLength"
      ],
      timestamp: new Date().toISOString()
    };

    console.log('RESULT:' + JSON.stringify(result));

    console.log('\n🎉 Digital Takeoff Tutorial Complete!');
    console.log('================================================================================');
    console.log(`📁 Video: ${videoPath}`);
    console.log('📱 Format: Vertical 9:16 - TikTok/Instagram ready');
    console.log('⏱️  Duration: 8 seconds');
    console.log(`💰 Cost: $${cost.toFixed(2)}`);
    console.log('\n✨ Advanced Techniques Applied:');
    console.log('   ✅ NO ALL CAPS text (VEO3 would spell letter-by-letter)');
    console.log('   ✅ Proper spelling: blueprint, measurements, calculator');
    console.log('   ✅ Screen recording style (no human)');
    console.log('   ✅ Professional software UI simulation');
    console.log('   ✅ Realistic cursor/automation movements');
    console.log('   ✅ VEO3 auto-corrections applied (caps, dialogue length)');
    console.log('\n🎯 Shows: Digital takeoff workflow with automated measurements\n');

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
generateDigitalTakeoffTutorial();
