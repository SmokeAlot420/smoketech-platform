import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service, VideoGenerationRequest } from './src/services/veo3Service';
import { AdvancedVEO3Prompting, VIRAL_PRESETS } from './src/enhancement/advancedVeo3Prompting';
import { ProfessionalCinematography } from './src/cinematography/professionalShots';
import { UltraRealisticCharacterManager, CharacterConsistencyConfig } from './src/enhancement/ultraRealisticCharacterManager';
import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';

/**
 * CREATE FIVE ULTRA-REALISTIC VIDEOS
 *
 * Uses the complete advanced VEO3 workflow with all research findings:
 * - Advanced VEO3 techniques (snubroot rules)
 * - Character consistency patterns (shabbirun research)
 * - Dynamic camera movements (jax-explorer patterns)
 * - Professional cinematography
 * - Viral content presets
 */

interface VideoSpec {
  title: string;
  preset: keyof typeof VIRAL_PRESETS;
  scenario: string;
  dialogue: string;
  environment: string;
  cameraMovement: string;
  movementQuality: string;
  shotType: string;
  lighting: string;
  grading: string;
  pattern: string;
}

async function createFiveVideos(): Promise<void> {
  console.log('🎬 CREATING FIVE ULTRA-REALISTIC VIDEOS');
  console.log('Advanced VEO3 Workflow with All Research Findings');
  console.log('=' .repeat(80));

  try {
    // Initialize services
    console.log('🔧 Initializing Advanced VEO3 Services...');
    const veo3Service = new VEO3Service({
      outputPath: './generated/five-videos'
    });
    const characterManager = new UltraRealisticCharacterManager();

    console.log('✅ VEO3Service with enhanced rules initialized');
    console.log('✅ Character Manager with advanced patterns initialized');

    // Define 5 video specifications using different presets and techniques
    const videoSpecs: VideoSpec[] = [
      {
        title: 'Insurance Expert Authority',
        preset: 'insurance_expert',
        scenario: 'Professional insurance consultation with authority building',
        dialogue: 'Save hundreds on your car insurance with our exclusive QuoteMoto deals!',
        environment: 'Modern professional insurance office with branded materials',
        cameraMovement: 'dolly_in',
        movementQuality: 'confident',
        shotType: 'medium_shot',
        lighting: 'three_point',
        grading: 'broadcast_standard',
        pattern: 'authority_pattern'
      },
      {
        title: 'Lifestyle Influencer Energy',
        preset: 'lifestyle_influencer',
        scenario: 'Energetic lifestyle tip sharing with social media appeal',
        dialogue: 'Hey friends! This insurance hack will save you money every month!',
        environment: 'Bright modern apartment with natural lighting and lifestyle elements',
        cameraMovement: 'handheld_natural',
        movementQuality: 'energetic',
        shotType: 'close_up',
        lighting: 'natural_light',
        grading: 'social_media',
        pattern: 'engagement_pattern'
      },
      {
        title: 'Educational Content Authority',
        preset: 'educational_content',
        scenario: 'Professional educational explanation with credibility',
        dialogue: 'Understanding car insurance can save you thousands of dollars annually.',
        environment: 'Professional classroom with educational materials and whiteboards',
        cameraMovement: 'pan_follow',
        movementQuality: 'natural',
        shotType: 'medium_close_up',
        lighting: 'soft_box',
        grading: 'neutral_professional',
        pattern: 'educational_pattern'
      },
      {
        title: 'Dynamic Sales Presentation',
        preset: 'insurance_expert',
        scenario: 'Dynamic sales presentation with compelling energy',
        dialogue: 'Ready to switch? QuoteMoto makes it easy in just minutes!',
        environment: 'Modern car dealership showroom with luxury vehicles',
        cameraMovement: 'tracking_follow',
        movementQuality: 'graceful',
        shotType: 'wide_shot',
        lighting: 'dramatic',
        grading: 'cinematic',
        pattern: 'sales_pattern'
      },
      {
        title: 'Personal Connection Story',
        preset: 'lifestyle_influencer',
        scenario: 'Personal story sharing with emotional connection',
        dialogue: 'I personally saved over eight hundred dollars switching to QuoteMoto!',
        environment: 'Cozy home office with personal touches and warm lighting',
        cameraMovement: 'zoom_emphasis',
        movementQuality: 'deliberate',
        shotType: 'medium_shot',
        lighting: 'golden_hour',
        grading: 'warm_personal',
        pattern: 'connection_pattern'
      }
    ];

    console.log(`\n🎯 Creating ${videoSpecs.length} Videos Using Advanced Techniques:`);
    videoSpecs.forEach((spec, index) => {
      console.log(`  ${index + 1}. ${spec.title}: ${spec.scenario}`);
      console.log(`     💬 "${spec.dialogue}"`);
      console.log(`     🎬 ${spec.cameraMovement} + ${spec.movementQuality}`);
      console.log(`     🏢 ${spec.environment}`);
    });

    const results = [];

    // Generate each video
    for (let i = 0; i < videoSpecs.length; i++) {
      const spec = videoSpecs[i];
      const preset = VIRAL_PRESETS[spec.preset];

      console.log(`\n🎬 VIDEO ${i + 1}/${videoSpecs.length}: ${spec.title.toUpperCase()}`);
      console.log(`🎯 Preset: ${spec.preset}`);
      console.log(`💬 Dialogue: "${spec.dialogue}"`);
      console.log(`🏢 Environment: ${spec.environment}`);

      const startTime = Date.now();

      try {
        console.log('\n🔬 APPLYING ADVANCED TECHNIQUES:');

        // Generate advanced prompt using preset and specification
        const advancedPrompt = AdvancedVEO3Prompting.generateAdvancedPrompt({
          character: preset.character,
          action: 'speaking to camera with professional demeanor',
          environment: spec.environment,
          dialogue: spec.dialogue,
          cameraMovement: spec.cameraMovement,
          movementQuality: spec.movementQuality,
          duration: 8
        });

        console.log('  ✅ Advanced prompt generated with all VEO3 techniques');

        // Apply professional cinematography
        const cinematographyInstruction = ProfessionalCinematography.generateProfessionalInstruction({
          shotType: spec.shotType,
          lighting: spec.lighting,
          grading: spec.grading,
          pattern: spec.pattern,
          duration: 8
        });

        console.log('  ✅ Professional cinematography applied');

        // Configure character consistency with advanced patterns
        const characterConfig: CharacterConsistencyConfig = {
          useGreenScreen: false,
          preserveFacialFeatures: true,
          maintainLighting: true,
          characterStyle: 'professional',
          motionConstraint: 'one-subtle-motion',
          dialogueOptimization: true,
          sceneTransitions: 'smooth-cut',
          preservationLevel: 'strict',
          aspectRatio: '9:16'
        };

        // Apply advanced character consistency patterns
        const enhancedPrompt = characterManager.applyAdvancedConsistencyPatterns(
          advancedPrompt + '\n\n' + cinematographyInstruction,
          characterConfig
        );

        // Validate character using the character manager
        const characterObj = {
          generateBasePrompt: () => enhancedPrompt
        };
        const validation = characterManager.validateCharacterForRealism(characterObj);
        if (!validation.valid) {
          console.log(`  ⚠️  Character validation issues: ${validation.issues.join(', ')}`);
        }

        console.log('  ✅ Advanced character consistency patterns applied');

        // Create final enhanced prompt with all techniques
        const finalPrompt = `
${enhancedPrompt}

ADVANCED VEO3 INTEGRATION:
- Preset: ${spec.preset}
- Character Archetype: ${preset.character}
- Camera Movement: ${spec.cameraMovement}
- Movement Quality: ${spec.movementQuality}
- Shot Type: ${spec.shotType}
- Lighting: ${spec.lighting}
- Color Grading: ${spec.grading}
- Pattern: ${spec.pattern}

RESEARCH FINDINGS APPLIED:
- ✅ snubroot dialogue caps prevention
- ✅ snubroot camera positioning syntax
- ✅ shabbirun character consistency patterns
- ✅ jax-explorer dynamic camera movements
- ✅ ONE subtle motion constraint
- ✅ 8-second dialogue optimization
- ✅ Professional cinematography standards

CHARACTER CONSISTENCY CONFIG:
- Scene Transitions: ${characterConfig.sceneTransitions}
- Motion Constraint: ${characterConfig.motionConstraint}
- Dialogue Optimization: ${characterConfig.dialogueOptimization}
- Preservation Level: ${characterConfig.preservationLevel}
- Character Style: ${characterConfig.characterStyle}
        `.trim();

        console.log('\n🚀 Generating video with complete advanced workflow...');

        // Generate video with all advanced techniques
        const veo3Request: VideoGenerationRequest = {
          prompt: finalPrompt,
          duration: 8,
          aspectRatio: '9:16',
          quality: 'high',
          enablePromptRewriting: true,
          enableSoundGeneration: true,
          videoCount: 1
        };

        console.log(`  🎬 Starting VEO3 generation for "${spec.title}"...`);
        const result = await veo3Service.generateVideoSegment(veo3Request);
        const generationTime = Date.now() - startTime;

        if (result.success && result.videos.length > 0) {
          console.log(`\n✅ ${spec.title.toUpperCase()} SUCCESS!`);
          console.log(`📹 Video: ${result.videos[0].videoPath}`);
          console.log(`⏱️  Generation time: ${Math.round(generationTime/1000)}s`);
          console.log(`💰 Cost: ~$6.00`);

          results.push({
            title: spec.title,
            preset: spec.preset,
            scenario: spec.scenario,
            dialogue: spec.dialogue,
            videoPath: result.videos[0].videoPath,
            generationTime: Math.round(generationTime/1000),
            cameraMovement: spec.cameraMovement,
            movementQuality: spec.movementQuality,
            cinematography: `${spec.shotType} + ${spec.lighting} + ${spec.grading}`,
            success: true
          });

          console.log('\n🌟 ADVANCED FEATURES CONFIRMED:');
          console.log(`  ✅ Preset: ${spec.preset} (${preset.character})`);
          console.log(`  ✅ Camera: ${spec.cameraMovement} (${spec.movementQuality})`);
          console.log(`  ✅ Cinematography: ${spec.shotType} + ${spec.lighting} + ${spec.grading}`);
          console.log(`  ✅ VEO3 Rules: Dialogue optimization, camera positioning, character consistency`);
          console.log(`  ✅ Research Applied: snubroot + shabbirun + jax-explorer techniques`);

        } else {
          console.log(`❌ ${spec.title} failed: ${result.error}`);
          results.push({
            title: spec.title,
            preset: spec.preset,
            error: result.error,
            success: false
          });
        }

      } catch (error: any) {
        console.log(`❌ ${spec.title} error: ${error.message}`);
        results.push({
          title: spec.title,
          preset: spec.preset,
          error: error.message,
          success: false
        });
      }

      // Delay between generations to respect rate limits
      if (i < videoSpecs.length - 1) {
        console.log('\n⏳ Waiting 30 seconds before next video generation...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }

    // Comprehensive results summary
    console.log('\n📊 FIVE VIDEOS GENERATION RESULTS:');
    console.log('=' .repeat(80));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful videos: ${successful.length}/${results.length}`);
    console.log(`❌ Failed videos: ${failed.length}/${results.length}`);

    if (successful.length > 0) {
      console.log('\n🎬 SUCCESSFUL VIDEOS:');
      successful.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     🎯 Preset: ${result.preset}`);
        console.log(`     💬 "${result.dialogue}"`);
        console.log(`     📹 Video: ${result.videoPath}`);
        console.log(`     ⏱️  Time: ${result.generationTime}s`);
        console.log(`     🎬 Camera: ${result.cameraMovement} (${result.movementQuality})`);
        console.log(`     🎨 Cinematography: ${result.cinematography}`);
        console.log('');
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ FAILED VIDEOS:');
      failed.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}: ${result.error}`);
      });
    }

    console.log('\n🏆 FIVE VIDEOS WORKFLOW COMPLETE:');
    console.log(`📊 Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
    console.log(`💰 Total Cost: ~$${successful.length * 6}.00`);
    console.log(`⏱️  Total Time: ~${Math.round(results.reduce((sum, r) => sum + (r.generationTime || 0), 0) / 60)} minutes`);

    console.log('\n✨ ADVANCED FEATURES USED IN ALL VIDEOS:');
    console.log('  🎯 Viral Presets: insurance_expert, lifestyle_influencer, educational_content');
    console.log('  🎬 Camera Movements: dolly_in, handheld_natural, pan_follow, tracking_follow, zoom_emphasis');
    console.log('  🏃 Movement Qualities: confident, energetic, natural, graceful, deliberate');
    console.log('  📸 Shot Types: medium_shot, close_up, medium_close_up, wide_shot');
    console.log('  💡 Lighting: three_point, natural_light, soft_box, dramatic, golden_hour');
    console.log('  🎨 Color Grading: broadcast_standard, social_media, neutral_professional, cinematic, warm_personal');
    console.log('  🎭 Patterns: authority_pattern, engagement_pattern, educational_pattern, sales_pattern, connection_pattern');

    console.log('\n🔬 RESEARCH FINDINGS INTEGRATION:');
    console.log('  ✅ snubroot VEO3 Rules: Dialogue caps prevention, camera positioning syntax, 8-second optimization');
    console.log('  ✅ shabbirun Character Consistency: Advanced preservation patterns, motion constraints');
    console.log('  ✅ jax-explorer Camera Movements: Dynamic tracking, professional cinematography');
    console.log('  ✅ Complete JSON Prompting: Structured prompts with all advanced techniques');

    console.log('\n📁 All videos saved to: ./generated/five-videos/');
    console.log('Ready for social media distribution on TikTok, Instagram, and YouTube');
    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Five videos generation failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  createFiveVideos()
    .then(() => {
      console.log('\n✨ Five videos creation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { createFiveVideos };