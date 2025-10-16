import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';
import fs from 'fs/promises';
import path from 'path';

interface AriaVideoConfig {
  name: string;
  imageName: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  duration: 4 | 6 | 8;
  platform: string;
  scenario: string;
  dialogue: string;
  movement: string;
  description: string;
}

interface VideoGenerationResult {
  config: AriaVideoConfig;
  success: boolean;
  videoPath?: string;
  error?: string;
  generationTime?: number;
  fileSize?: string;
}

/**
 * Generate the 2 Missing Aria Videos (Instagram and LinkedIn)
 * Fixed with supported aspect ratios: 9:16 and 16:9
 */
async function generateMissingAriaVideos(): Promise<void> {
  console.log('🎬 MISSING ARIA VIDEOS GENERATION');
  console.log('Generating Instagram and LinkedIn videos with corrected aspect ratios');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    const veo3 = new VEO3Service();

    // Find the character library
    const characterLibraryDir = await findLatestCharacterLibrary();
    const ariaDir = path.join(characterLibraryDir, 'aria');

    console.log(`📁 Using character library: ${characterLibraryDir}`);
    console.log(`👤 Aria images directory: ${ariaDir}`);

    // Define only the 2 missing video configurations with fixed aspect ratios
    const videoConfigs: AriaVideoConfig[] = [
      {
        name: 'three-quarter-instagram',
        imageName: 'aria-three-quarter-standing',
        aspectRatio: '9:16', // Changed from 1:1 to 9:16
        duration: 6,
        platform: 'Instagram Feed (Vertical)',
        scenario: 'Quick insurance pro tip',
        dialogue: 'Pro tip: Bundle your auto and home insurance with QuoteMoto and save even more. Most people save 25% or more when they bundle!',
        movement: 'Aria delivers confident tip with engaging gestures, slight lean toward camera, knowing smile, professional yet approachable energy',
        description: 'Instagram-optimized vertical tip content showcasing QuoteMoto bundling benefits'
      },
      {
        name: 'headshot-corporate',
        imageName: 'aria-professional-headshot',
        aspectRatio: '16:9', // Changed from 1:1 to 16:9
        duration: 6,
        platform: 'LinkedIn/Corporate',
        scenario: 'Expert testimonial',
        dialogue: 'As an insurance expert at QuoteMoto, I help thousands of customers save money every month. Get your free quote today and join the savings.',
        movement: 'Aria maintains professional headshot presence, subtle confident head movements, direct authoritative eye contact, trustworthy expert demeanor',
        description: 'Corporate testimonial establishing QuoteMoto expertise and credibility'
      }
    ];

    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.cwd(), 'generated', 'videos', 'aria', `missing-${timestamp}`);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    const results: VideoGenerationResult[] = [];

    // Generate each missing video
    for (let i = 0; i < videoConfigs.length; i++) {
      const config = videoConfigs[i];
      console.log(`\n🎬 Video ${i + 1}/2: ${config.name}`);
      console.log(`📱 Platform: ${config.platform}`);
      console.log(`📐 Aspect ratio: ${config.aspectRatio} (FIXED - was 1:1)`);
      console.log(`⏱️  Duration: ${config.duration} seconds`);
      console.log(`🎯 Scenario: ${config.scenario}`);

      try {
        // Find the corresponding image file
        const imageFiles = await fs.readdir(ariaDir);
        const imageFile = imageFiles.find(file =>
          file.includes(config.imageName) && file.endsWith('.png')
        );

        if (!imageFile) {
          throw new Error(`Image not found for ${config.imageName}`);
        }

        const imagePath = path.join(ariaDir, imageFile);
        console.log(`📸 Using image: ${imageFile}`);

        // Construct the enhanced VEO3 prompt
        const veo3Prompt = createVEO3Prompt(config);
        console.log(`📝 Generating video with optimized prompt...`);

        const startTime = Date.now();

        // Generate video using VEO3
        const result = await veo3.generateVideoSegment({
          prompt: veo3Prompt,
          firstFrame: imagePath,
          duration: config.duration,
          aspectRatio: config.aspectRatio,
          quality: 'standard',
          videoCount: 1,
          enableSoundGeneration: true,
          enablePromptRewriting: true
        });

        const generationTime = Date.now() - startTime;

        if (result.success && result.videos.length > 0) {
          const videoPath = result.videos[0].videoPath;
          console.log(`✅ Video generated successfully!`);
          console.log(`🎥 Video path: ${videoPath}`);
          console.log(`⏱️  Generation time: ${Math.round(generationTime/1000)}s`);
          console.log(`💰 Cost: $${(config.duration * 0.75).toFixed(2)}`);

          // Get file size
          const stats = await fs.stat(videoPath);
          const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`📊 File size: ${fileSizeMB} MB`);

          results.push({
            config,
            success: true,
            videoPath,
            generationTime,
            fileSize: `${fileSizeMB} MB`
          });

        } else {
          console.log(`❌ Video generation failed: ${result.error}`);
          results.push({
            config,
            success: false,
            error: result.error || 'Unknown error'
          });
        }

      } catch (error: any) {
        console.log(`❌ Video ${i + 1} failed:`, error.message);
        results.push({
          config,
          success: false,
          error: error.message
        });
      }

      // Rate limiting pause between generations
      if (i < videoConfigs.length - 1) {
        console.log('⏱️  Waiting 7 seconds for rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 7000));
      }
    }

    // Save results metadata
    const metadata = {
      generated: timestamp,
      totalVideos: results.length,
      successfulVideos: results.filter(r => r.success).length,
      successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
      purpose: 'Generate missing Instagram and LinkedIn videos with corrected aspect ratios',
      fixApplied: {
        instagram: 'Changed aspect ratio from 1:1 to 9:16 (vertical format)',
        linkedin: 'Changed aspect ratio from 1:1 to 16:9 (landscape format)'
      },
      videos: results,
      totalCost: `$${results.filter(r => r.success).reduce((sum, r) => sum + (r.config.duration * 0.75), 0).toFixed(2)}`
    };

    await fs.writeFile(
      path.join(outputDir, `missing-aria-videos-metadata-${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );

    console.log('\n\n🎉 MISSING ARIA VIDEOS GENERATION COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Success rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`);
    console.log(`🎬 Videos generated: ${results.filter(r => r.success).length}/${results.length}`);

    console.log('\n📋 GENERATION SUMMARY:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      const aspectNote = result.config.aspectRatio === '1:1' ? ' (WOULD FAIL)' : ' (FIXED)';
      console.log(`  ${status} ${result.config.name} (${result.config.aspectRatio}${aspectNote})`);
    });

    if (results.filter(r => r.success).length === 2) {
      console.log('\n🚀 ALL 4 ARIA VIDEOS NOW COMPLETE!');
      console.log('  ✅ TikTok (9:16) - Previously generated');
      console.log('  ✅ YouTube (16:9) - Previously generated');
      console.log('  ✅ Instagram (9:16) - Fixed and generated');
      console.log('  ✅ LinkedIn (16:9) - Fixed and generated');
    }

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Missing Aria videos generation failed:', error.message);
    throw error;
  }
}

/**
 * Find the latest character library directory
 */
async function findLatestCharacterLibrary(): Promise<string> {
  const libraryRoot = path.join(process.cwd(), 'generated', 'character-library');

  try {
    const directories = await fs.readdir(libraryRoot);
    const timestampDirs = directories.filter(dir => dir.match(/^\d{4}-\d{2}-\d{2}T/));

    if (timestampDirs.length === 0) {
      throw new Error('No character library found. Run generate-full-character-library.ts first.');
    }

    // Sort by timestamp (latest first)
    timestampDirs.sort().reverse();
    const latestDir = path.join(libraryRoot, timestampDirs[0]);

    // Verify aria directory exists
    const ariaDir = path.join(latestDir, 'aria');
    await fs.access(ariaDir);

    return latestDir;
  } catch (error) {
    throw new Error(`Character library not found or invalid: ${error}`);
  }
}

/**
 * Create optimized VEO3 prompt for each video configuration
 */
function createVEO3Prompt(config: AriaVideoConfig): string {
  return `Professional insurance expert Aria from QuoteMoto presenting ${config.scenario}.

PRESERVE: Exact Aria facial features, QuoteMoto branding, and professional identity

CHARACTER CONSISTENCY:
- Maintain Aria's amber-brown eyes and confident expression
- Keep QuoteMoto navy blue blazer and branding visible
- Preserve warm professional demeanor and trustworthy presence

SCENARIO: ${config.scenario}
DIALOGUE: "${config.dialogue}"

MOVEMENT AND ACTION:
${config.movement}

PLATFORM OPTIMIZATION:
- Optimized for ${config.platform}
- ${config.aspectRatio} aspect ratio for maximum engagement
- ${config.duration}-second duration for platform algorithm optimization

TECHNICAL REQUIREMENTS:
- Professional video quality with natural lighting
- Clear audio synchronization with lip movement
- Smooth, realistic human movement and expressions
- QuoteMoto brand elements clearly visible

AUDIO GENERATION:
- Clear, professional female voice
- Confident, trustworthy tone appropriate for insurance expert
- Perfect lip synchronization with generated speech
- ${config.duration}-second duration matching video length

AVOID: Over-processed movement, robotic gestures, artificial lighting, inconsistent character features, poor lip sync, unnatural expressions`;
}

// Execute if run directly
if (require.main === module) {
  generateMissingAriaVideos()
    .then(() => {
      console.log('\n✨ Missing Aria videos generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateMissingAriaVideos };