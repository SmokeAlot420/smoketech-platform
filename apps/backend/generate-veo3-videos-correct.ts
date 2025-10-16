import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { VEO3Service, VideoGenerationRequest } from './src/services/veo3Service';

interface VideoSpec {
  imagePath: string;
  scenario: string;
  script: string;
  topic: string;
  context: string;
  outputName: string;
}

interface VideoResult {
  imageName: string;
  scenario: string;
  success: boolean;
  outputPaths?: string[];
  duration?: number;
  error?: string;
}

/**
 * CORRECT VEO3 VIDEO GENERATION
 * Using proper VEO3Service with veo-3.0-generate-preview model
 * REST API via predictLongRunning endpoint
 */
async function generateCorrectVeo3Videos(): Promise<void> {
  console.log('🎬 CORRECT VEO3 VIDEO GENERATION');
  console.log('Using veo-3.0-generate-preview model via REST API');
  console.log('Image-to-video with proper firstFrame input');
  console.log('Sign off as SmokeDev 🚬');
  console.log('=' .repeat(80));

  try {
    // Initialize VEO3Service
    const veo3 = new VEO3Service({
      outputPath: './generated/veo3-correct'
    });

    // Setup paths
    const masterDir = path.join(
      process.cwd(),
      'generated',
      'improved-master',
      '2025-09-28T01-37-57-620Z'
    );

    console.log(`📁 Master images: ${masterDir}\n`);

    // Define video specifications for selected images
    const videoSpecs: VideoSpec[] = [
      {
        imagePath: path.join(masterDir, 'aria-home-consultation-branded.png'),
        scenario: 'home-consultation',
        topic: 'Home Insurance Savings Tips',
        script: "Hi! I'm Aria from QuoteMoto. Did you know bundling your home and auto insurance can save you up to 25%? Let me show you how our personalized quotes help homeowners like you find the perfect coverage at unbeatable rates. Get your free quote today!",
        context: 'Warm, approachable consultation in client home setting',
        outputName: 'aria-home-consultation-branded'
      },
      {
        imagePath: path.join(masterDir, 'aria-modern-insurance-office.png'),
        scenario: 'office-professional',
        topic: 'Understanding Insurance Deductibles',
        script: "Understanding deductibles is key to choosing the right insurance. A higher deductible means lower monthly payments, but more out-of-pocket if you file a claim. I'll help you find the perfect balance for your budget and peace of mind.",
        context: 'Professional office setting, educational and authoritative',
        outputName: 'aria-office-deductibles'
      },
      {
        imagePath: path.join(masterDir, 'aria-modern-insurance-office-branded.png'),
        scenario: 'office-branded',
        topic: 'QuoteMoto Exclusive Discounts',
        script: "At QuoteMoto, we believe everyone deserves affordable insurance. That's why we offer exclusive discounts for safe drivers, students, military families, and bundled policies. Our AI-powered platform finds you the best rates in seconds. Experience the QuoteMoto difference today!",
        context: 'Professional QuoteMoto office, confident brand presentation',
        outputName: 'aria-quotemoto-discounts'
      },
      {
        imagePath: path.join(masterDir, 'aria-parking-lot-consultation.png'),
        scenario: 'parking-lot-inspection',
        topic: 'Post-Accident Checklist',
        script: "Been in an accident? Here's what to do: First, ensure everyone's safe. Take photos of all vehicles and damage. Exchange insurance information. Call the police if needed. Then contact your insurance company immediately. Stay calm - I'm here to help guide you through the process.",
        context: 'Outdoor parking lot, helpful and reassuring tone',
        outputName: 'aria-accident-checklist'
      },
      {
        imagePath: path.join(masterDir, 'aria-parking-lot-consultation-branded.png'),
        scenario: 'parking-lot-branded',
        topic: 'QuoteMoto Claims Process',
        script: "Filing a claim with QuoteMoto is simple and stress-free. Our 24/7 claims hotline connects you instantly with expert adjusters. We handle everything digitally - upload photos, track progress, and get updates in real-time. QuoteMoto makes claims fast and fair.",
        context: 'Professional outdoor consultation with QuoteMoto branding',
        outputName: 'aria-quotemoto-claims'
      },
      {
        imagePath: path.join(masterDir, 'aria-video-call-office.png'),
        scenario: 'video-call-setup',
        topic: 'Virtual Consultation Benefits',
        script: "Why travel to an office when expert insurance advice is just a video call away? Our virtual consultations are convenient, secure, and personalized. Get the same professional service from the comfort of your home. Schedule your free virtual consultation today!",
        context: 'Home office video call setup, modern and convenient',
        outputName: 'aria-virtual-consultation'
      },
      {
        imagePath: path.join(masterDir, 'aria-car-dealership.png'),
        scenario: 'car-dealership',
        topic: 'New Car Insurance Tips',
        script: "Buying a new car? Don't forget about insurance! Get quotes before you buy to avoid surprises. Consider comprehensive coverage for new vehicles. Ask about discounts for safety features like anti-theft systems and automatic braking. I'll help you protect your investment.",
        context: 'Modern car dealership showroom, helpful buying advice',
        outputName: 'aria-new-car-insurance'
      },
      {
        imagePath: path.join(masterDir, 'aria-corporate-lobby.png'),
        scenario: 'corporate-lobby',
        topic: 'Business Insurance Essentials',
        script: "Protecting your business is protecting your future. From general liability to cyber security coverage, the right insurance shields you from unexpected costs. Every business is unique, so let's create a custom protection plan that fits your specific needs and budget.",
        context: 'Professional corporate setting, business-focused messaging',
        outputName: 'aria-business-insurance'
      }
    ];

    console.log(`🎯 Generating ${videoSpecs.length} videos with correct VEO3 service\n`);

    const results: VideoResult[] = [];

    // Generate each video using proper VEO3Service
    for (let i = 0; i < videoSpecs.length; i++) {
      const spec = videoSpecs[i];
      console.log(`\n🎬 Video ${i + 1}/${videoSpecs.length}: ${spec.scenario}`);
      console.log(`📋 Topic: ${spec.topic}`);
      console.log(`📍 Context: ${spec.context}`);
      console.log(`📝 Script: "${spec.script.substring(0, 80)}..."`);

      try {
        // Verify image exists
        await fs.access(spec.imagePath);
        console.log(`✅ Image found: ${path.basename(spec.imagePath)}`);

        // Create VEO3 request with firstFrame (image-to-video)
        const veo3Request: VideoGenerationRequest = {
          prompt: `Professional insurance expert Aria speaking directly to camera: "${spec.script}"

Context: ${spec.context}
Topic: ${spec.topic}

Technical requirements:
- Perfect lip sync with provided dialogue
- Natural facial expressions and gestures
- Professional insurance commercial quality
- Maintain character consistency from reference image
- 8-second duration optimized for social media`,
          duration: 8,
          aspectRatio: '9:16', // Optimized for TikTok/Instagram
          firstFrame: spec.imagePath, // This is the key - image-to-video
          quality: 'high',
          enablePromptRewriting: true,
          enableSoundGeneration: true,
          videoCount: 1
        };

        console.log('🎥 Generating with VEO3 REST API...');
        const startTime = Date.now();

        // Generate video using proper VEO3Service
        const result = await veo3.generateVideoSegment(veo3Request);
        const generationTime = Date.now() - startTime;

        if (result.success && result.videos.length > 0) {
          console.log(`✅ Generated: ${result.videos[0].videoPath}`);
          console.log(`⏱️  Time: ${Math.round(generationTime/1000)}s`);
          console.log(`💰 Cost: ~$0.75`);

          results.push({
            imageName: path.basename(spec.imagePath),
            scenario: spec.scenario,
            success: true,
            outputPaths: result.videos.map((v: any) => v.videoPath),
            duration: generationTime
          });
        } else {
          throw new Error(result.error || 'VEO3 generation failed');
        }

        // Rate limiting pause (VEO3 has 10 requests/minute limit)
        if (i < videoSpecs.length - 1) {
          console.log('⏱️  Waiting 7 seconds for VEO3 rate limiting...');
          await new Promise(resolve => setTimeout(resolve, 7000));
        }

      } catch (error: any) {
        console.log(`❌ Failed: ${error.message}`);
        results.push({
          imageName: path.basename(spec.imagePath),
          scenario: spec.scenario,
          success: false,
          error: error.message
        });
      }
    }

    // Generate final report
    await generateVideoReport(results, videoSpecs);

    console.log('\n\n🎉 CORRECT VEO3 VIDEO GENERATION COMPLETED!');
    console.log(`📁 Videos in: ./generated/veo3-correct/`);

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Success rate: ${((successCount/results.length)*100).toFixed(1)}%`);
    console.log(`🎬 Videos generated: ${successCount}/${results.length}`);
    console.log(`💰 Total cost: ~$${(successCount * 0.75).toFixed(2)}`);

    console.log('\n📋 VIDEO SUMMARY:');
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.scenario} - ${videoSpecs[index]?.topic || 'Unknown'}`);
    });

    console.log('\n🚀 PRODUCTION-READY VIDEOS FOR SOCIAL MEDIA!');
    console.log('All videos optimized for TikTok, Instagram Reels, and YouTube Shorts');
    console.log('\nSign off as SmokeDev 🚬');

  } catch (error: any) {
    console.error('\n❌ VEO3 video generation failed:', error.message);
    throw error;
  }
}

/**
 * Generate video report
 */
async function generateVideoReport(results: VideoResult[], specs: VideoSpec[]): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = './generated/veo3-correct';

  await fs.mkdir(reportDir, { recursive: true });

  const report = {
    generated: timestamp,
    service: 'VEO3Service with veo-3.0-generate-preview model',
    endpoint: 'REST API predictLongRunning',
    totalVideos: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    successRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
    estimatedCost: `$${(results.filter(r => r.success).length * 0.75).toFixed(2)}`,
    videos: results.map((result, index) => ({
      scenario: result.scenario,
      topic: specs[index]?.topic,
      script: specs[index]?.script,
      success: result.success,
      outputPaths: result.outputPaths,
      generationTime: result.duration ? `${Math.round(result.duration/1000)}s` : undefined,
      error: result.error
    })),
    configuration: {
      model: 'veo-3.0-generate-preview',
      duration: '8 seconds',
      aspectRatio: '9:16 (TikTok/Instagram optimized)',
      quality: 'high',
      firstFrame: 'Image-to-video mode',
      promptRewriting: 'enabled',
      soundGeneration: 'enabled'
    }
  };

  await fs.writeFile(
    path.join(reportDir, `veo3-generation-report-${timestamp}.json`),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📊 Report saved: ${reportDir}/veo3-generation-report-${timestamp}.json`);
}

// Execute if run directly
if (require.main === module) {
  generateCorrectVeo3Videos()
    .then(() => {
      console.log('\n✨ VEO3 video generation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateCorrectVeo3Videos };