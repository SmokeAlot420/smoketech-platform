import { QuoteMotoAdGenerator } from './generate-quotemoto-ads';
import * as fs from 'fs/promises';
import * as path from 'path';

interface VEO3VideoGeneration {
  scenarioId: string;
  scenarioName: string;
  imageInputPath: string;
  videoPrompt: string;
  videoDescription: string;
  outputPath: string;
  duration: number;
  metadata: {
    generatedAt: Date;
    model: string;
    inputImage: string;
    commercial: boolean;
    brand: string;
  };
}

interface CommercialScript {
  title: string;
  duration: number;
  spokesperson: string;
  keyMessage: string;
  callToAction: string;
  visualElements: string[];
  voiceoverScript: string;
}

class VEO3CommercialGenerator {
  private outputDir: string = './outputs/quotemoto-campaign/videos';
  private imageDir: string = './outputs/quotemoto-campaign/images';
  private generator: QuoteMotoAdGenerator;

  constructor() {
    this.generator = new QuoteMotoAdGenerator();
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'scripts'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'metadata'), { recursive: true });

    console.log(`🎬 Video output directories created: ${this.outputDir}`);
  }

  async generateCommercialScripts(): Promise<CommercialScript[]> {
    return [
      {
        title: 'QuoteMoto Introduction Commercial',
        duration: 30,
        spokesperson: 'Aria',
        keyMessage: 'Professional insurance expert who makes coverage simple',
        callToAction: 'Visit QuoteMoto.com or call 1-800-QUOTEMOTO',
        visualElements: [
          'Professional office setting with Aria at desk',
          'Computer showing insurance quotes and savings',
          'QuoteMoto branding throughout',
          'Professional, trustworthy atmosphere'
        ],
        voiceoverScript: `Hi, I'm Aria from QuoteMoto. Whether you've had tickets, accidents, or even a DUI - we've got you covered. At QuoteMoto, your driving record doesn't define your rate. Get your personalized quote in under 2 minutes and start saving today. QuoteMoto - insurance for everyone. Visit QuoteMoto.com or call 1-800-QUOTEMOTO.`
      },
      {
        title: 'QuoteMoto Savings Testimonial',
        duration: 30,
        spokesperson: 'Aria',
        keyMessage: 'Real savings for real customers',
        callToAction: 'Get your quote today at QuoteMoto.com',
        visualElements: [
          'Studio setting with Aria presenting',
          'Graphics showing average savings of $487/year',
          'Professional presentation style',
          'Clean QuoteMoto branding'
        ],
        voiceoverScript: `I'm Aria, and I've helped thousands of drivers save on their car insurance. Our customers save an average of $487 per year with QuoteMoto. We specialize in coverage for drivers others won't insure. Tickets? No problem. Accidents? We've got you. DUI? We can help. Don't let your past define your rates. QuoteMoto - save money, drive happy.`
      },
      {
        title: 'QuoteMoto Quick Quote Demo',
        duration: 30,
        spokesperson: 'Aria',
        keyMessage: 'Get quotes fast and easy',
        callToAction: '2-minute quotes at QuoteMoto.com',
        visualElements: [
          'Aria with tablet/smartphone showing app',
          'Demo of quick quote process',
          'Modern, tech-forward presentation',
          'Professional mobile demonstration'
        ],
        voiceoverScript: `Getting car insurance shouldn't be complicated. I'm Aria from QuoteMoto, and I'll show you how easy it is. Just enter your info here... select your coverage... and get your quote in under 2 minutes. It's really that simple. Whether you need full coverage, liability, or SR-22, we make it easy. QuoteMoto - quick quotes, real savings.`
      }
    ];
  }

  async generateVEO3VideoPrompts(): Promise<VEO3VideoGeneration[]> {
    console.log('🎥 Generating VEO3 Commercial Video Prompts...\n');

    await this.initialize();
    const adCampaign = await this.generator.generateCompleteQuoteMotoAds();
    const commercialScripts = await this.generateCommercialScripts();
    const videoGenerations: VEO3VideoGeneration[] = [];

    // Save commercial scripts
    for (let i = 0; i < commercialScripts.length; i++) {
      const script = commercialScripts[i];
      const scriptPath = path.join(this.outputDir, 'scripts', `commercial_${i + 1}_script.json`);
      await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));
      console.log(`📝 Saved script: ${script.title}`);
    }

    // Generate VEO3 prompts for each scenario
    for (let i = 0; i < Math.min(adCampaign.length, 6); i++) {
      const ad = adCampaign[i];
      const scenarioId = ad.scenario.id;
      const videoPrompts = this.generator.generateVEO3VideoPrompts(ad.scenario);

      // Enhanced VEO3 prompt for professional commercials
      const enhancedVideoPrompt = this.createEnhancedVEO3Prompt(ad.scenario, videoPrompts);

      const imageInputPath = path.join(this.imageDir, `${scenarioId}_aria_professional.png`);
      const videoOutputPath = path.join(this.outputDir, `${scenarioId}_commercial.mp4`);

      const videoGeneration: VEO3VideoGeneration = {
        scenarioId,
        scenarioName: ad.scenario.name,
        imageInputPath,
        videoPrompt: enhancedVideoPrompt,
        videoDescription: videoPrompts.videoDescription,
        outputPath: videoOutputPath,
        duration: 5, // 5-second clips for social media
        metadata: {
          generatedAt: new Date(),
          model: 'VEO3',
          inputImage: imageInputPath,
          commercial: true,
          brand: 'QuoteMoto'
        }
      };

      videoGenerations.push(videoGeneration);

      // Save video generation metadata
      const metadataPath = path.join(this.outputDir, 'metadata', `${scenarioId}_video_metadata.json`);
      await fs.writeFile(metadataPath, JSON.stringify(videoGeneration, null, 2));

      console.log(`🎬 Generated VEO3 prompt for: ${ad.scenario.name}`);
    }

    return videoGenerations;
  }

  private createEnhancedVEO3Prompt(scenario: any, basePrompts: any): string {
    const messageTypeInstructions = {
      'savings': 'confident professional explanation with slight head nod and reassuring smile',
      'dui-friendly': 'empathetic understanding expression with gentle consulting gestures',
      'quick-quote': 'friendly demonstration with device interaction and approachable energy',
      'customer-service': 'professional consultation with forward-leaning engagement',
      'testimonial': 'authentic endorsement with confident professional presentation'
    };

    const environmentInstructions = {
      'office': 'professional office environment with natural corporate movement',
      'studio': 'clean studio setting with controlled professional presentation',
      'car': 'automotive interior with realistic driving-related gestures',
      'dealership': 'showroom environment with professional sales presentation style'
    };

    return `
PROFESSIONAL COMMERCIAL VIDEO (5 seconds):

ARIA'S PERFORMANCE:
${messageTypeInstructions[scenario.messageType] || 'professional insurance expert presentation'}

ENVIRONMENT CONTEXT:
${environmentInstructions[scenario.environment] || 'professional business setting'}

MOVEMENT REQUIREMENTS:
- Maintain professional posture throughout
- Natural facial expressions conveying trustworthiness
- Subtle hand gestures appropriate for insurance expertise
- Direct eye contact with camera for brand connection
- Professional energy level suitable for corporate advertising

TECHNICAL REQUIREMENTS:
- Smooth, professional commercial-quality movement
- Consistent lighting throughout motion
- Maintain character identity and facial features
- Professional insurance spokesperson presentation
- Brand-appropriate professional demeanor

ENHANCED VEO3 PROMPT:
${basePrompts.imageToVideoPrompt}

COMMERCIAL QUALITY STANDARDS:
- Enterprise-level professional video output
- Suitable for television and digital advertising
- Consistent with QuoteMoto brand identity
- Professional spokesperson presentation throughout
- High-quality commercial production values
`.trim();
  }

  async generateVEO3ExecutionGuide(): Promise<void> {
    const executionGuide = {
      title: 'VEO3 Commercial Video Generation Guide',
      overview: 'Step-by-step guide for generating QuoteMoto commercial videos using VEO3',
      prerequisites: [
        'Generated professional photos from generate-professional-photos.ts',
        'VEO3 API access and credentials configured',
        'Input images saved in outputs/quotemoto-campaign/images/',
        'Video generation prompts from this script'
      ],
      executionSteps: [
        {
          step: 1,
          title: 'Prepare Input Images',
          description: 'Ensure all professional Aria photos are generated and saved',
          command: 'npm run generate:photos'
        },
        {
          step: 2,
          title: 'Generate VEO3 Prompts',
          description: 'Run this script to generate optimized video prompts',
          command: 'npx ts-node generate-commercial-videos.ts'
        },
        {
          step: 3,
          title: 'Execute VEO3 Generation',
          description: 'Use VEO3 API with generated prompts and input images',
          apiCall: {
            endpoint: 'VEO3_API_ENDPOINT',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer VEO3_API_KEY',
              'Content-Type': 'application/json'
            },
            body: {
              input_image: 'base64_encoded_image',
              prompt: 'enhanced_veo3_prompt',
              duration: 5,
              quality: 'commercial',
              resolution: '1920x1080'
            }
          }
        },
        {
          step: 4,
          title: 'Post-Processing',
          description: 'Add QuoteMoto branding, text overlays, and audio',
          requirements: [
            'QuoteMoto logo overlay',
            'Contact information: 1-800-QUOTEMOTO',
            'Website: QuoteMoto.com',
            'Professional voiceover (optional)',
            'Background music (corporate/professional)'
          ]
        }
      ],
      outputFormats: [
        '1920x1080 (HD) for web and social media',
        '1080x1920 (Vertical) for TikTok/Instagram Stories',
        '1200x1200 (Square) for Instagram feed',
        '1920x1080 (Landscape) for YouTube and Facebook'
      ],
      commercialSpecs: {
        duration: '5-30 seconds per clip',
        quality: 'Broadcast/commercial quality',
        format: 'MP4 H.264',
        framerate: '30fps',
        audio: 'Professional voiceover + background music',
        branding: 'QuoteMoto logo and contact information'
      }
    };

    const guidePath = path.join(this.outputDir, 'VEO3_Execution_Guide.json');
    await fs.writeFile(guidePath, JSON.stringify(executionGuide, null, 2));

    console.log(`📖 VEO3 Execution Guide saved: ${guidePath}`);
  }

  async generateCompleteCampaign(): Promise<{
    videoPrompts: VEO3VideoGeneration[];
    commercialScripts: CommercialScript[];
  }> {
    console.log('🎬 Starting Complete VEO3 Commercial Campaign Generation...\n');

    const videoPrompts = await this.generateVEO3VideoPrompts();
    const commercialScripts = await this.generateCommercialScripts();

    await this.generateVEO3ExecutionGuide();

    // Generate campaign overview
    const campaignOverview = {
      campaign: 'QuoteMoto VEO3 Commercial Video Campaign',
      spokesperson: 'Aria - Ultra-Realistic Insurance Expert',
      totalVideos: videoPrompts.length,
      totalScripts: commercialScripts.length,
      generatedAt: new Date(),
      videoTypes: [
        'Professional office consultations',
        'Studio presentations',
        'In-car demonstrations',
        'Customer service scenarios',
        'Brand testimonials',
        'Automotive settings'
      ],
      commercialFocus: [
        'DUI-friendly insurance options',
        'Quick quote demonstrations',
        'Savings testimonials',
        'Professional expertise',
        'Brand trust and reliability'
      ],
      technicalSpecs: {
        inputImages: 'Ultra-realistic professional photos',
        videoModel: 'VEO3',
        duration: '5 seconds per clip',
        quality: 'Commercial broadcast quality',
        resolution: 'HD 1920x1080',
        branding: 'QuoteMoto corporate identity'
      }
    };

    const overviewPath = path.join(this.outputDir, 'campaign_overview.json');
    await fs.writeFile(overviewPath, JSON.stringify(campaignOverview, null, 2));

    console.log('\n🎉 VEO3 Commercial Campaign Generation Complete!');
    console.log(`📹 Generated ${videoPrompts.length} video prompts`);
    console.log(`📝 Created ${commercialScripts.length} commercial scripts`);
    console.log(`📁 All files saved to: ${this.outputDir}`);
    console.log('🚀 Ready for VEO3 video generation API calls');

    return { videoPrompts, commercialScripts };
  }
}

// Main execution
async function main() {
  try {
    const videoGenerator = new VEO3CommercialGenerator();
    const campaign = await videoGenerator.generateCompleteCampaign();

    console.log('\n📊 Campaign Summary:');
    console.log(`🎬 Video Scenarios: ${campaign.videoPrompts.length}`);
    console.log(`📺 Commercial Scripts: ${campaign.commercialScripts.length}`);
    console.log('✅ Ready for professional video production');

  } catch (error) {
    console.error('💥 Video campaign generation failed:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { VEO3CommercialGenerator, VEO3VideoGeneration, CommercialScript };