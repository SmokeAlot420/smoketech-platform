/**
 * ZHO + VEO3 INTEGRATION EXAMPLES
 * Complete test suite for enhanced viral content generation
 * Tests all combinations: NanoBanana → ZHO → VEO3 → Character Consistency
 */

// Load environment variables first
import { config } from 'dotenv';
config();

import { ZHOVeo3IntegrationEngine, ZHOVeo3Config } from '../veo3/zho-veo3-integration';
import { QuoteMotoBrandingEngine, QuoteMotoLogoConfig } from '../veo3/quotemoto-branding-engine';
import { EyeRealismEnhancer, EyeRealismConfig } from '../veo3/eye-realism-enhancer';
import { VertexAINanoBananaService } from '../services/vertexAINanoBanana';
import path from 'path';

// ========================================================================
// TEST CONFIGURATIONS
// ========================================================================

const TEST_OUTPUT_DIR = './output/zho-veo3-tests';

// Example 1: Basic ZHO + VEO3 Integration
const BASIC_INTEGRATION_CONFIG: ZHOVeo3Config = {
  character: 'aria_quotemoto',
  platform: 'tiktok',
  applyQuoteMotoLogo: true,
  fixAIEyes: true,
  enhanceLighting: true,
  applyZHOTechniques: [31], // Universal style-to-realism
  outputDir: path.join(TEST_OUTPUT_DIR, 'basic-integration'),
  generateMetadata: true,
  segments: [
    {
      dialogue: "Discover amazing savings with QuoteMoto, TikTok's #1 insurance marketplace!",
      action: "confidently presenting insurance benefits with engaging gestures",
      environment: "modern professional office with QuoteMoto branding"
    }
  ]
};

// Example 2: Advanced Viral Content with Multiple ZHO Techniques
const VIRAL_CONTENT_CONFIG: ZHOVeo3Config = {
  character: 'aria_quotemoto',
  platform: 'youtube',
  applyQuoteMotoLogo: true,
  fixAIEyes: true,
  enhanceLighting: true,
  applyZHOTechniques: [1, 31, 25], // Figure transformation, realism, professional photography
  outputDir: path.join(TEST_OUTPUT_DIR, 'viral-content'),
  generateMetadata: true,
  segments: [
    {
      dialogue: "Welcome to QuoteMoto, where we help you save hundreds on car insurance!",
      action: "enthusiastic welcome gesture with professional confidence",
      environment: "modern insurance office with branded elements",
      zhoEnhancements: [31] // Extra realism for intro
    },
    {
      dialogue: "Compare 30+ carriers and save up to $500 per year with just one click!",
      action: "demonstrating QuoteMoto app interface on phone screen",
      environment: "contemporary California setting with natural lighting"
    },
    {
      dialogue: "Get your free quote now - fast, easy, and no obligation!",
      action: "pointing to QuoteMoto call-to-action with confident smile",
      environment: "professional studio with branded background"
    }
  ]
};

// Example 3: Professional Corporate Content
const CORPORATE_CONFIG: ZHOVeo3Config = {
  character: 'aria_quotemoto',
  platform: 'instagram',
  applyQuoteMotoLogo: true,
  fixAIEyes: true,
  enhanceLighting: true,
  applyZHOTechniques: [25, 2], // Professional photography, ultra-realistic portrait
  outputDir: path.join(TEST_OUTPUT_DIR, 'corporate'),
  generateMetadata: true,
  segments: [
    {
      dialogue: "At QuoteMoto, we believe everyone deserves affordable car insurance.",
      action: "professional presentation with authentic corporate messaging",
      environment: "executive office with insurance industry professional atmosphere"
    }
  ]
};

// ========================================================================
// TEST RUNNERS
// ========================================================================

export class ZHOVeo3TestSuite {
  private integrationEngine: ZHOVeo3IntegrationEngine;
  private brandingEngine: QuoteMotoBrandingEngine;
  private eyeEnhancer: EyeRealismEnhancer;
  private nanoBanana: VertexAINanoBananaService;

  constructor() {
    this.integrationEngine = new ZHOVeo3IntegrationEngine();
    this.brandingEngine = new QuoteMotoBrandingEngine();
    this.eyeEnhancer = new EyeRealismEnhancer();
    this.nanoBanana = new VertexAINanoBananaService();
  }

  /**
   * EXAMPLE 1: Basic ZHO + VEO3 Integration Test
   */
  async runBasicIntegrationTest(): Promise<void> {
    console.log('🚀 EXAMPLE 1: BASIC ZHO + VEO3 INTEGRATION');
    console.log('Testing: NanoBanana → Eye Fix → Logo → VEO3');
    console.log('Cost: ~$12 (1 enhanced image + 1 video segment)');
    console.log('');

    try {
      const result = await this.integrationEngine.generateEnhancedViralContent(BASIC_INTEGRATION_CONFIG);

      console.log('✅ Basic integration test complete!');
      console.log(`💰 Total cost: $${result.production.totalCost.toFixed(4)}`);
      console.log(`👁️ Eye realism: ${result.production.eyeRealismScore}%`);
      console.log(`🏷️ Brand visibility: ${result.production.brandingVisibility}%`);
      console.log(`🚀 Viral potential: ${result.production.viralPotential}`);
      console.log(`📁 Output: ${BASIC_INTEGRATION_CONFIG.outputDir}`);
      console.log('');

    } catch (error) {
      console.error('❌ Basic integration test failed:', error);
    }
  }

  /**
   * EXAMPLE 2: Advanced Viral Content Test
   */
  async runViralContentTest(): Promise<void> {
    console.log('🚀 EXAMPLE 2: ADVANCED VIRAL CONTENT GENERATION');
    console.log('Testing: Multiple ZHO techniques + 3 video segments');
    console.log('Cost: ~$30 (3 enhanced images + 3 video segments)');
    console.log('');

    try {
      const result = await this.integrationEngine.generateEnhancedViralContent(VIRAL_CONTENT_CONFIG);

      console.log('✅ Viral content test complete!');
      console.log(`💰 Total cost: $${result.production.totalCost.toFixed(4)}`);
      console.log(`🎬 Videos generated: ${result.videos.length}`);
      console.log(`🎨 ZHO techniques applied: ${VIRAL_CONTENT_CONFIG.applyZHOTechniques.length}`);
      console.log(`📊 Quality score: ${result.production.qualityScore}%`);
      console.log(`🚀 Viral potential: ${result.production.viralPotential}`);
      console.log(`📁 Output: ${VIRAL_CONTENT_CONFIG.outputDir}`);
      console.log('');

    } catch (error) {
      console.error('❌ Viral content test failed:', error);
    }
  }

  /**
   * EXAMPLE 3: Corporate Professional Test
   */
  async runCorporateTest(): Promise<void> {
    console.log('🚀 EXAMPLE 3: CORPORATE PROFESSIONAL CONTENT');
    console.log('Testing: Executive-level branding + professional enhancement');
    console.log('Cost: ~$12 (1 enhanced image + 1 video segment)');
    console.log('');

    try {
      const result = await this.integrationEngine.generateEnhancedViralContent(CORPORATE_CONFIG);

      console.log('✅ Corporate test complete!');
      console.log(`💰 Total cost: $${result.production.totalCost.toFixed(4)}`);
      console.log(`🏢 Professional score: ${result.production.qualityScore}%`);
      console.log(`👁️ Eye realism: ${result.production.eyeRealismScore}%`);
      console.log(`🏷️ Brand visibility: ${result.production.brandingVisibility}%`);
      console.log(`📁 Output: ${CORPORATE_CONFIG.outputDir}`);
      console.log('');

    } catch (error) {
      console.error('❌ Corporate test failed:', error);
    }
  }

  /**
   * EXAMPLE 4: Eye Realism Enhancement Test
   */
  async runEyeRealismTest(): Promise<void> {
    console.log('🚀 EXAMPLE 4: EYE REALISM ENHANCEMENT');
    console.log('Testing: AI eye detection → ZHO #31 enhancement');
    console.log('Cost: ~$2 (1 enhanced image)');
    console.log('');

    try {
      // Generate base image with typical AI eyes
      const basePrompt = `Professional insurance advisor portrait with typical AI-generated eyes`;
      const baseImages = await this.nanoBanana.generateImage(basePrompt, { numImages: 1 });

      if (baseImages.length === 0) {
        throw new Error('Failed to generate base image for eye test');
      }

      const baseImage = baseImages[0];

      // Analyze eye issues
      const analysis = this.eyeEnhancer.analyzeEyeRealism(baseImage);
      console.log(`📊 Initial realism score: ${analysis.current_scores.realism}%`);

      // Apply eye enhancement
      const eyeConfig: EyeRealismConfig = {
        enhancement_level: 'dramatic',
        fix_symmetry: true,
        add_imperfections: true,
        enhance_moisture: true,
        preserve_eye_color: true,
        preserve_expression: true,
        preserve_makeup: false,
        focus_area: 'periorbital',
        quality_target: 'ultra_realistic'
      };

      const result = await this.eyeEnhancer.enhanceEyeRealism(baseImage, eyeConfig);

      console.log('✅ Eye realism test complete!');
      console.log(`👁️ Realism improvement: +${result.after_scores.improvement}%`);
      console.log(`👁️ Final realism score: ${result.after_scores.realism}%`);
      console.log(`👁️ Naturalness score: ${result.after_scores.naturalness}%`);
      console.log(`💰 Enhancement cost: $${result.enhanced_image.metadata.cost.toFixed(4)}`);
      console.log('');

    } catch (error) {
      console.error('❌ Eye realism test failed:', error);
    }
  }

  /**
   * EXAMPLE 5: QuoteMoto Branding Test
   */
  async runBrandingTest(): Promise<void> {
    console.log('🚀 EXAMPLE 5: QUOTEMOTO BRANDING INTEGRATION');
    console.log('Testing: All branding placement options');
    console.log('Cost: ~$8 (2 branded images)');
    console.log('');

    try {
      // Generate base professional image
      const basePrompt = `Professional insurance advisor in business attire, clean background`;
      const baseImages = await this.nanoBanana.generateImage(basePrompt, { numImages: 1 });

      if (baseImages.length === 0) {
        throw new Error('Failed to generate base image for branding test');
      }

      const baseImage = baseImages[0];

      // Test polo shirt branding
      console.log('🏷️ Testing polo shirt logo placement...');
      const poloConfig: QuoteMotoLogoConfig = {
        logoPlacement: 'polo_shirt',
        logoSize: 'medium',
        logoVisibility: 'moderate',
        includeTagline: false,
        office_setting: 'modern',
        industry_elements: true,
        professionalLevel: 'corporate',
        platform: 'tiktok'
      };

      const poloResult = await this.brandingEngine.applyQuoteMotoBranding(baseImage, poloConfig);

      console.log(`✅ Polo branding applied - Visibility: ${poloResult.brandingScore.visibility}%`);

      // Test comprehensive branding
      console.log('🏷️ Testing comprehensive branding...');
      const comprehensiveConfig: QuoteMotoLogoConfig = {
        logoPlacement: 'both',
        logoSize: 'medium',
        logoVisibility: 'prominent',
        includeTagline: true,
        customMessage: 'Save up to $500 per year',
        office_setting: 'modern',
        industry_elements: true,
        professionalLevel: 'executive',
        platform: 'youtube'
      };

      const comprehensiveResult = await this.brandingEngine.applyQuoteMotoBranding(baseImage, comprehensiveConfig);

      console.log('✅ Branding test complete!');
      console.log(`🏷️ Polo visibility: ${poloResult.brandingScore.visibility}%`);
      console.log(`🏷️ Comprehensive visibility: ${comprehensiveResult.brandingScore.visibility}%`);
      console.log(`💰 Total branding cost: $${(poloResult.brandedImage.metadata.cost + comprehensiveResult.brandedImage.metadata.cost).toFixed(4)}`);
      console.log('');

    } catch (error) {
      console.error('❌ Branding test failed:', error);
    }
  }

  /**
   * Run all tests in sequence
   */
  async runAllTests(): Promise<void> {
    console.log('🎯 ZHO + VEO3 INTEGRATION TEST SUITE');
    console.log('Running all examples to demonstrate full system capabilities');
    console.log('Expected total cost: ~$64 (all tests combined)');
    console.log('Expected time: 15-25 minutes');
    console.log('');
    console.log('==========================================');
    console.log('');

    const startTime = Date.now();

    // Run each test
    await this.runBasicIntegrationTest();
    await this.runViralContentTest();
    await this.runCorporateTest();
    await this.runEyeRealismTest();
    await this.runBrandingTest();

    const totalTime = Date.now() - startTime;

    console.log('==========================================');
    console.log('');
    console.log('🎯 ALL TESTS COMPLETE!');
    console.log(`⏱️ Total execution time: ${(totalTime / 1000 / 60).toFixed(1)} minutes`);
    console.log(`📁 All outputs saved to: ${TEST_OUTPUT_DIR}`);
    console.log('');
    console.log('🚀 ZHO + VEO3 INTEGRATION SYSTEM READY FOR PRODUCTION!');
    console.log('');
  }
}

// ========================================================================
// COMMAND LINE INTERFACE
// ========================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const testSuite = new ZHOVeo3TestSuite();

  if (args.length === 0) {
    console.log('🎯 ZHO + VEO3 INTEGRATION EXAMPLES');
    console.log('');
    console.log('Available commands:');
    console.log('  --example=1  Basic ZHO + VEO3 integration');
    console.log('  --example=2  Advanced viral content generation');
    console.log('  --example=3  Corporate professional content');
    console.log('  --example=4  Eye realism enhancement');
    console.log('  --example=5  QuoteMoto branding integration');
    console.log('  --all        Run all examples');
    console.log('');
    console.log('Usage: npm run zho:veo3 -- --example=1');
    console.log('   or: npm run zho:veo3 -- --all');
    return;
  }

  const exampleArg = args.find(arg => arg.startsWith('--example='));
  const allFlag = args.includes('--all');

  if (allFlag) {
    await testSuite.runAllTests();
  } else if (exampleArg) {
    const exampleNumber = exampleArg.split('=')[1];

    switch (exampleNumber) {
      case '1':
        await testSuite.runBasicIntegrationTest();
        break;
      case '2':
        await testSuite.runViralContentTest();
        break;
      case '3':
        await testSuite.runCorporateTest();
        break;
      case '4':
        await testSuite.runEyeRealismTest();
        break;
      case '5':
        await testSuite.runBrandingTest();
        break;
      default:
        console.error(`❌ Unknown example: ${exampleNumber}`);
        console.log('Available examples: 1, 2, 3, 4, 5');
    }
  } else {
    console.error('❌ Please specify --example=N or --all');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}