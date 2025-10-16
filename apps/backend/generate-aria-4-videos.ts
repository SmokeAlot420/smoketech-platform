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
 * Generate 4 Aria QuoteMoto Videos Using Different Shot Types
 * Uses the character library images as firstFrame inputs for VEO3
 */
async function generateAria4Videos(): Promise<void> {
  console.log('🎬 ARIA 4-VIDEO GENERATION SUITE');
  console.log('Using character library images for VEO3 video generation');
  console.log('Platform-optimized videos with authentic QuoteMoto messaging');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    // Initialize VEO3 service
    const veo3 = new VEO3Service();

    // Find the most recent character library directory
    const characterLibraryDir = await findLatestCharacterLibrary();
    const ariaDir = path.join(characterLibraryDir, 'aria');

    console.log(`📁 Using character library: ${characterLibraryDir}`);
    console.log(`👤 Aria images directory: ${ariaDir}`);

    // Define video configurations for each shot type
    const videoConfigs: AriaVideoConfig[] = [
      {
        name: 'full-body-standing-tiktok',
        imageName: 'aria-full-body-standing',
        aspectRatio: '9:16',
        duration: 8,
        platform: 'TikTok/Instagram Reels',
        scenario: 'Dynamic walk-and-talk viral content',
        dialogue: 'Hey! Did you know QuoteMoto can save you hundreds on car insurance? I switched last month and saved $180! Takes literally 2 minutes to compare rates. Link in bio!',
        movement: 'Aria walks confidently toward camera with dynamic gestures, points enthusiastically while explaining savings, maintains high energy and direct eye contact',
        description: 'Viral TikTok-style content showcasing QuoteMoto savings with energetic delivery'
      },
      {
        name: 'full-body-seated-consultation',
        imageName: 'aria-full-body-seated',
        aspectRatio: '16:9',
        duration: 8,
        platform: 'YouTube/Website',
        scenario: 'Professional desk consultation',
        dialogue: 'At QuoteMoto, we understand insurance can be confusing. That\'s why we make it simple. Compare quotes from top insurers instantly and save hundreds on your car insurance.',
        movement: 'Aria maintains professional seated posture, uses explanatory hand gestures, leans slightly forward showing engagement, warm professional eye contact',
        description: 'Professional consultation video demonstrating QuoteMoto expertise and trust'
      },
      {
        name: 'three-quarter-instagram',
        imageName: 'aria-three-quarter-standing',
        aspectRatio: '9:16',
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
        aspectRatio: '16:9',
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
    const outputDir = path.join(process.cwd(), 'generated', 'videos', 'aria', timestamp);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`📁 Output directory: ${outputDir}\n`);

    const results: VideoGenerationResult[] = [];

    // Generate each video
    for (let i = 0; i < videoConfigs.length; i++) {
      const config = videoConfigs[i];
      console.log(`\n🎬 Video ${i + 1}/4: ${config.name}`);
      console.log(`📱 Platform: ${config.platform}`);
      console.log(`📐 Aspect ratio: ${config.aspectRatio}`);
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

    // Save comprehensive results metadata
    const metadata = {
      generated: timestamp,
      totalVideos: results.length,
      successfulVideos: results.filter(r => r.success).length,
      successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
      characterUsed: 'Aria QuoteMoto Insurance Expert',
      sourceImages: characterLibraryDir,
      videos: results,
      platformOptimization: {
        tiktok: results.find(r => r.config.name === 'full-body-standing-tiktok')?.success || false,
        youtube: results.find(r => r.config.name === 'full-body-seated-consultation')?.success || false,
        instagram: results.find(r => r.config.name === 'three-quarter-instagram')?.success || false,
        linkedin: results.find(r => r.config.name === 'headshot-corporate')?.success || false
      },
      totalCost: `$${results.filter(r => r.success).reduce((sum, r) => sum + (r.config.duration * 0.75), 0).toFixed(2)}`,
      veo3Features: {
        imageToVideo: 'Used character library images as firstFrame',
        nativeAudio: 'Generated synchronized speech for all videos',
        promptRewriting: 'Enhanced with VEO3 prompt optimization',
        rateLimiting: 'Automatic throttling for 10 requests/minute quota'
      }
    };

    await fs.writeFile(
      path.join(outputDir, `aria-4-videos-metadata-${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );

    // Create usage summary
    const summary = `
ARIA 4-VIDEO GENERATION SUMMARY
Generated: ${timestamp}

📊 RESULTS:
✅ Successful: ${results.filter(r => r.success).length}/${results.length} videos
📈 Success Rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%
💰 Total Cost: $${results.filter(r => r.success).reduce((sum, r) => sum + (r.config.duration * 0.75), 0).toFixed(2)}

🎬 VIDEOS GENERATED:
${results.map((r, i) => `${i + 1}. ${r.config.name} (${r.config.platform}) - ${r.success ? '✅ SUCCESS' : '❌ FAILED'}`).join('\n')}

📱 PLATFORM READINESS:
• TikTok/Reels: ${results.find(r => r.config.name === 'full-body-standing-tiktok')?.success ? '✅ Ready' : '❌ Failed'}
• YouTube: ${results.find(r => r.config.name === 'full-body-seated-consultation')?.success ? '✅ Ready' : '❌ Failed'}
• Instagram: ${results.find(r => r.config.name === 'three-quarter-instagram')?.success ? '✅ Ready' : '❌ Failed'}
• LinkedIn: ${results.find(r => r.config.name === 'headshot-corporate')?.success ? '✅ Ready' : '❌ Failed'}

🚀 READY FOR:
✅ Multi-platform QuoteMoto content distribution
✅ Character-consistent brand messaging
✅ Professional insurance marketing campaigns
✅ Viral social media content with authentic messaging

Sign off as SmokeDev 🚬
`;

    await fs.writeFile(
      path.join(outputDir, `aria-4-videos-summary-${timestamp}.txt`),
      summary
    );

    console.log('\n\n🎉 ARIA 4-VIDEO GENERATION COMPLETED!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Success rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`);
    console.log(`🎬 Videos generated: ${results.filter(r => r.success).length}/${results.length}`);

    console.log('\n📋 GENERATION SUMMARY:');
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.config.name} (${result.config.platform})`);
    });

    console.log('\n🚀 VIDEOS READY FOR:');
    console.log('  ✅ Multi-platform QuoteMoto content distribution');
    console.log('  ✅ Character-consistent brand messaging across all platforms');
    console.log('  ✅ Professional insurance marketing campaigns');
    console.log('  ✅ Viral social media content with authentic QuoteMoto messaging');

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ Aria 4-video generation failed:', error.message);
    if (error.message?.includes('429')) {
      console.log('⚠️ API quota limit reached. Try again later.');
    } else if (error.message?.includes('character library')) {
      console.log('⚠️ Character library not found. Run generate-full-character-library.ts first.');
    }
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
  generateAria4Videos()
    .then(() => {
      console.log('\n✨ Aria 4-video generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateAria4Videos };