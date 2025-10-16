import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generate just the LinkedIn video with 16:9 aspect ratio
 */
async function generateLinkedInVideo(): Promise<void> {
  console.log('🎬 LINKEDIN VIDEO GENERATION');
  console.log('Generating final missing video with 16:9 aspect ratio');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(50));

  try {
    const veo3 = new VEO3Service();

    // Find the character library
    const characterLibraryDir = await findLatestCharacterLibrary();
    const ariaDir = path.join(characterLibraryDir, 'aria');

    console.log(`📁 Using character library: ${characterLibraryDir}`);
    console.log(`👤 Aria images directory: ${ariaDir}`);

    // LinkedIn video configuration
    const config = {
      name: 'headshot-corporate',
      imageName: 'aria-professional-headshot',
      aspectRatio: '16:9' as const,
      duration: 6 as const,
      platform: 'LinkedIn/Corporate',
      scenario: 'Expert testimonial',
      dialogue: 'As an insurance expert at QuoteMoto, I help thousands of customers save money every month. Get your free quote today and join the savings.',
      movement: 'Aria maintains professional headshot presence, subtle confident head movements, direct authoritative eye contact, trustworthy expert demeanor',
      description: 'Corporate testimonial establishing QuoteMoto expertise and credibility'
    };

    console.log(`\n🎬 Generating: ${config.name}`);
    console.log(`📱 Platform: ${config.platform}`);
    console.log(`📐 Aspect ratio: ${config.aspectRatio} (FIXED - was 1:1)`);
    console.log(`⏱️  Duration: ${config.duration} seconds`);
    console.log(`🎯 Scenario: ${config.scenario}`);

    // Find the image file
    const imageFiles = await fs.readdir(ariaDir);
    const imageFile = imageFiles.find(file =>
      file.includes(config.imageName) && file.endsWith('.png')
    );

    if (!imageFile) {
      throw new Error(`Image not found for ${config.imageName}`);
    }

    const imagePath = path.join(ariaDir, imageFile);
    console.log(`📸 Using image: ${imageFile}`);

    // Create the VEO3 prompt
    const veo3Prompt = `Professional insurance expert Aria from QuoteMoto presenting ${config.scenario}.

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

    console.log(`📝 Generating LinkedIn video...`);

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
      console.log(`\n✅ LinkedIn video generated successfully!`);
      console.log(`🎥 Video path: ${videoPath}`);
      console.log(`⏱️  Generation time: ${Math.round(generationTime/1000)}s`);
      console.log(`💰 Cost: $${(config.duration * 0.75).toFixed(2)}`);

      // Get file size
      const stats = await fs.stat(videoPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 File size: ${fileSizeMB} MB`);

      console.log('\n🎉 ALL 4 ARIA VIDEOS NOW COMPLETE!');
      console.log('  ✅ TikTok (9:16) - Full body standing');
      console.log('  ✅ YouTube (16:9) - Full body seated');
      console.log('  ✅ Instagram (9:16) - Three-quarter standing');
      console.log('  ✅ LinkedIn (16:9) - Professional headshot');

      console.log('\n🚀 READY FOR MULTI-PLATFORM DISTRIBUTION!');

    } else {
      console.log(`❌ LinkedIn video generation failed: ${result.error}`);
    }

    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ LinkedIn video generation failed:', error.message);
    throw error;
  }
}

async function findLatestCharacterLibrary(): Promise<string> {
  const libraryRoot = path.join(process.cwd(), 'generated', 'character-library');
  const directories = await fs.readdir(libraryRoot);
  const timestampDirs = directories.filter(dir => dir.match(/^\d{4}-\d{2}-\d{2}T/));

  if (timestampDirs.length === 0) {
    throw new Error('No character library found.');
  }

  timestampDirs.sort().reverse();
  const latestDir = path.join(libraryRoot, timestampDirs[0]);
  return latestDir;
}

// Execute if run directly
if (require.main === module) {
  generateLinkedInVideo()
    .then(() => {
      console.log('\n✨ LinkedIn video generation complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}