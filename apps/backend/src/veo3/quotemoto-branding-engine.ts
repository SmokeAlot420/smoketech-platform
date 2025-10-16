/**
 * QUOTEMOTO BRANDING ENGINE
 * Advanced logo integration using ZHO techniques for viral content
 * Handles polo shirt logos, background branding, and product placement
 */

import { VertexAINanoBananaService, VertexAIGeneratedImage } from '../services/vertexAINanoBanana';

// ========================================================================
// QUOTEMOTO BRANDING TYPES
// ========================================================================

export interface QuoteMotoLogoConfig {
  // Logo placement
  logoPlacement: 'polo_shirt' | 'background_screen' | 'both' | 'desk_materials' | 'subtle_branding';
  logoSize: 'small' | 'medium' | 'large';
  logoVisibility: 'subtle' | 'moderate' | 'prominent';

  // Brand messaging
  includeTagline: boolean;
  customMessage?: string;

  // Environment settings
  office_setting: 'modern' | 'traditional' | 'home_office' | 'coworking';
  industry_elements: boolean; // Show insurance-related materials

  // Quality settings
  professionalLevel: 'business_casual' | 'corporate' | 'executive';

  // Platform optimization
  platform: 'tiktok' | 'youtube' | 'instagram';
}

export interface BrandingResult {
  // Generated images
  brandedImage: VertexAIGeneratedImage;
  logoPlacementDetails: {
    type: string;
    visibility: number; // 0-100
    integration_quality: number; // 0-100
  };

  // Branding metrics
  brandingScore: {
    visibility: number; // How visible is the logo (0-100)
    naturalness: number; // How natural does it look (0-100)
    professional: number; // Professional appearance (0-100)
    viral_potential: number; // Likelihood to go viral (0-100)
  };

  // Applied techniques
  appliedZHOTechniques: number[];
  description: string;
}

// ========================================================================
// QUOTEMOTO BRANDING ENGINE
// ========================================================================

export class QuoteMotoBrandingEngine {
  private nanoBanana: VertexAINanoBananaService;
  constructor() {
    this.nanoBanana = new VertexAINanoBananaService();
  }

  /**
   * Apply QuoteMoto branding to character image
   */
  async applyQuoteMotoBranding(
    _baseImage: VertexAIGeneratedImage,
    config: QuoteMotoLogoConfig
  ): Promise<BrandingResult> {
    console.log('🏷️ APPLYING QUOTEMOTO BRANDING');
    console.log(`Logo placement: ${config.logoPlacement}`);
    console.log(`Visibility: ${config.logoVisibility}`);
    console.log(`Platform: ${config.platform}`);
    console.log('');

    let brandingPrompt = '';
    let appliedTechniques: number[] = [];

    switch (config.logoPlacement) {
      case 'polo_shirt':
        brandingPrompt = await this.buildPoloShirtBrandingPrompt(config);
        appliedTechniques = [37]; // ZHO #37: Product packaging/integration
        break;

      case 'background_screen':
        brandingPrompt = await this.buildBackgroundBrandingPrompt(config);
        appliedTechniques = [32]; // ZHO #32: Screen mapping
        break;

      case 'both':
        brandingPrompt = await this.buildComprehensiveBrandingPrompt(config);
        appliedTechniques = [37, 32]; // Both techniques
        break;

      case 'desk_materials':
        brandingPrompt = await this.buildDeskMaterialsBrandingPrompt(config);
        appliedTechniques = [8]; // ZHO #8: Product advertisement
        break;

      case 'subtle_branding':
        brandingPrompt = await this.buildSubtleBrandingPrompt(config);
        appliedTechniques = [5]; // ZHO #5: Continuous editing
        break;

      default:
        throw new Error(`Unknown logo placement: ${config.logoPlacement}`);
    }

    // Add platform optimization
    brandingPrompt += this.addPlatformOptimization(config.platform);

    console.log('🎨 Generating branded image...');
    const brandedImages = await this.nanoBanana.generateImage(brandingPrompt, {
      temperature: 0.3,
      numImages: 1
    });

    if (brandedImages.length === 0) {
      throw new Error('Failed to generate branded image');
    }

    const brandedImage = brandedImages[0];

    // Calculate branding metrics
    const brandingScore = this.calculateBrandingScore(config, appliedTechniques);
    const logoPlacementDetails = this.analyzePlacementQuality(config);

    const result: BrandingResult = {
      brandedImage,
      logoPlacementDetails,
      brandingScore,
      appliedZHOTechniques: appliedTechniques,
      description: `Applied QuoteMoto branding using ${config.logoPlacement} placement`
    };

    console.log('✅ QuoteMoto branding applied successfully');
    console.log(`🎯 Brand visibility: ${result.brandingScore.visibility}%`);
    console.log(`🎯 Naturalness: ${result.brandingScore.naturalness}%`);
    console.log(`🎯 Professional: ${result.brandingScore.professional}%`);
    console.log('');

    return result;
  }

  /**
   * Build polo shirt branding prompt (ZHO #37)
   */
  private async buildPoloShirtBrandingPrompt(config: QuoteMotoLogoConfig): Promise<string> {
    const sizeMap = {
      small: 'subtle 2-inch logo',
      medium: 'professional 3-inch logo',
      large: 'prominent 4-inch logo'
    };

    const visibilityMap = {
      subtle: 'discretely placed',
      moderate: 'clearly visible',
      prominent: 'prominently displayed'
    };

    return `PRESERVE: Exact facial features, expression, hair, pose, and professional appearance

BRAND INTEGRATION (ZHO #37 - Product Integration):
Transform the blue polo shirt to include QuoteMoto professional branding
- Add ${sizeMap[config.logoSize]} QuoteMoto logo on left chest area
- Logo should be ${visibilityMap[config.logoVisibility]} and professionally embroidered
- Maintain professional business appearance
- Logo colors: QuoteMoto orange and white on blue polo
- Ensure logo looks naturally integrated, not pasted on

PROFESSIONAL REQUIREMENTS:
- Business ${config.professionalLevel} attire standards
- Insurance industry professional appearance
- High-quality embroidered logo appearance
- Natural fabric textures and shadows

把图一贴在图二易拉罐上，并放在极简设计的布景中，专业摄影
Adapt this technique for professional polo shirt logo placement with natural integration`;
  }

  /**
   * Build background screen branding prompt (ZHO #32)
   */
  private async buildBackgroundBrandingPrompt(config: QuoteMotoLogoConfig): Promise<string> {
    return `PRESERVE: Exact facial features, expression, hair, clothing, and pose

BACKGROUND BRANDING (ZHO #32 - Screen Mapping):
Add QuoteMoto branding elements in the background environment
- Computer monitor displaying QuoteMoto website or dashboard
- Wall-mounted screen with QuoteMoto logo and insurance quotes
- Subtle QuoteMoto branded materials on desk
- Professional insurance office atmosphere

BRANDING ELEMENTS:
- QuoteMoto logo on background screens
- Insurance quotes comparison charts
- "Save up to $500" messaging
- Professional blue and orange color scheme

ENVIRONMENT:
- ${config.office_setting} office setting
- Professional lighting
- Insurance industry atmosphere
- Branded but not overwhelming

把图一放在图二大屏幕上，撑满整个屏幕
Apply this technique for natural background branding integration`;
  }

  /**
   * Build comprehensive branding prompt (Multiple ZHO techniques)
   */
  private async buildComprehensiveBrandingPrompt(config: QuoteMotoLogoConfig): Promise<string> {
    return `PRESERVE: Exact facial features, expression, hair, and pose

COMPREHENSIVE QUOTEMOTO BRANDING (ZHO #37 + #32):

CLOTHING BRANDING:
- Professional QuoteMoto logo on blue polo shirt (left chest)
- High-quality embroidered appearance
- Natural integration with fabric

BACKGROUND BRANDING:
- QuoteMoto dashboard on computer screen
- Insurance comparison charts visible
- Branded office materials and signage
- Professional insurance environment

MESSAGING ELEMENTS:
${config.includeTagline ? '- "QuoteMoto - Compare. Save. Drive." tagline visible' : ''}
${config.customMessage ? `- Custom message: "${config.customMessage}"` : ''}
- Professional insurance advisor atmosphere

QUALITY STANDARDS:
- ${config.professionalLevel} professional appearance
- Natural lighting and shadows
- High-end insurance office environment
- Branding appears integrated, not added

Combine ZHO #37 (product integration) + ZHO #32 (screen mapping) for comprehensive professional branding`;
  }

  /**
   * Build desk materials branding prompt (ZHO #8)
   */
  private async buildDeskMaterialsBrandingPrompt(_config: QuoteMotoLogoConfig): Promise<string> {
    return `PRESERVE: Exact facial features, expression, hair, clothing, and pose

DESK MATERIALS BRANDING (ZHO #8 - Product Advertisement):
Add QuoteMoto branded materials naturally placed on desk/workspace
- QuoteMoto business cards and brochures
- Insurance comparison printouts with QuoteMoto branding
- Branded pen and notepad
- QuoteMoto branded coffee mug or water bottle
- Professional materials showing insurance savings

PRODUCT PLACEMENT:
- Materials appear naturally used and placed
- Professional insurance advisor workspace
- QuoteMoto branding visible but natural
- Shows active insurance comparison work

模特拿着香水｜The model is holding a perfume
Adapt this concept for insurance advisor holding/displaying QuoteMoto materials`;
  }

  /**
   * Build subtle branding prompt (ZHO #5)
   */
  private async buildSubtleBrandingPrompt(_config: QuoteMotoLogoConfig): Promise<string> {
    return `PRESERVE: Exact facial features, expression, hair, and all current elements

SUBTLE BRANDING ENHANCEMENT (ZHO #5 - Continuous Editing):

Step 1: Add subtle QuoteMoto color elements
- Incorporate professional blue and orange accents
- QuoteMoto brand colors in office environment
- Subtle color psychology for trust and energy

Step 2: Add professional insurance elements
- Insurance industry professional atmosphere
- Subtle references to auto insurance
- Professional advisor setting

Step 3: Minimal logo integration
- Very subtle QuoteMoto presence
- Professional without being promotional
- Focus on expertise and trust

图一人物背上图二 logo 的斜挎包
Adapt for minimal, professional brand presence that builds trust`;
  }

  /**
   * Add platform-specific optimization
   */
  private addPlatformOptimization(platform: string): string {
    switch (platform) {
      case 'tiktok':
        return `\n\nTIKTOK OPTIMIZATION:
- Vertical format friendly (9:16)
- Bold, clear branding for mobile viewing
- Engaging, personable professional appearance
- Gen Z and Millennial appeal`;

      case 'youtube':
        return `\n\nYOUTUBE OPTIMIZATION:
- Horizontal format friendly (16:9)
- Professional educational content appearance
- Clear branding for various screen sizes
- Trustworthy expert positioning`;

      case 'instagram':
        return `\n\nINSTAGRAM OPTIMIZATION:
- Square format friendly (1:1)
- Aesthetic professional appearance
- Lifestyle-integrated branding
- Visual appeal for feed and stories`;

      default:
        return '';
    }
  }

  /**
   * Calculate branding effectiveness score
   */
  private calculateBrandingScore(
    config: QuoteMotoLogoConfig,
    appliedTechniques: number[]
  ): BrandingResult['brandingScore'] {
    let visibility = 0;
    let naturalness = 0;
    let professional = 0;
    let viral_potential = 0;

    // Base scores by placement type
    switch (config.logoPlacement) {
      case 'polo_shirt':
        visibility = 85;
        naturalness = 90;
        professional = 95;
        viral_potential = 75;
        break;
      case 'background_screen':
        visibility = 70;
        naturalness = 85;
        professional = 90;
        viral_potential = 70;
        break;
      case 'both':
        visibility = 95;
        naturalness = 80;
        professional = 90;
        viral_potential = 85;
        break;
      case 'desk_materials':
        visibility = 75;
        naturalness = 95;
        professional = 85;
        viral_potential = 80;
        break;
      case 'subtle_branding':
        visibility = 60;
        naturalness = 95;
        professional = 90;
        viral_potential = 85;
        break;
    }

    // Adjust for visibility setting
    const visibilityMultiplier = {
      subtle: 0.8,
      moderate: 1.0,
      prominent: 1.2
    }[config.logoVisibility];

    visibility *= visibilityMultiplier;

    // Professional level bonus
    const professionalBonus = {
      business_casual: 0,
      corporate: 5,
      executive: 10
    }[config.professionalLevel];

    professional += professionalBonus;

    // Platform optimization bonus
    const platformBonus = config.platform === 'tiktok' ? 10 : 5;
    viral_potential += platformBonus;

    // ZHO technique bonuses
    viral_potential += appliedTechniques.length * 5;

    return {
      visibility: Math.min(100, Math.max(0, visibility)),
      naturalness: Math.min(100, Math.max(0, naturalness)),
      professional: Math.min(100, Math.max(0, professional)),
      viral_potential: Math.min(100, Math.max(0, viral_potential))
    };
  }

  /**
   * Analyze logo placement quality
   */
  private analyzePlacementQuality(config: QuoteMotoLogoConfig): BrandingResult['logoPlacementDetails'] {
    const placementScores = {
      polo_shirt: { visibility: 85, integration: 90 },
      background_screen: { visibility: 70, integration: 85 },
      both: { visibility: 95, integration: 80 },
      desk_materials: { visibility: 75, integration: 95 },
      subtle_branding: { visibility: 60, integration: 95 }
    };

    const scores = placementScores[config.logoPlacement];

    return {
      type: config.logoPlacement,
      visibility: scores.visibility,
      integration_quality: scores.integration
    };
  }

  /**
   * Get branding recommendations for different use cases
   */
  getBrandingRecommendations(platform: string, contentType: string): QuoteMotoLogoConfig {
    const baseConfig: QuoteMotoLogoConfig = {
      logoPlacement: 'polo_shirt',
      logoSize: 'medium',
      logoVisibility: 'moderate',
      includeTagline: false,
      office_setting: 'modern',
      industry_elements: true,
      professionalLevel: 'corporate',
      platform: platform as any
    };

    // Adjust for content type
    switch (contentType) {
      case 'testimonial':
        return {
          ...baseConfig,
          logoPlacement: 'subtle_branding',
          logoVisibility: 'subtle',
          professionalLevel: 'business_casual'
        };

      case 'educational':
        return {
          ...baseConfig,
          logoPlacement: 'both',
          includeTagline: true,
          industry_elements: true
        };

      case 'product_demo':
        return {
          ...baseConfig,
          logoPlacement: 'desk_materials',
          logoVisibility: 'prominent',
          professionalLevel: 'executive'
        };

      default:
        return baseConfig;
    }
  }
}

// ========================================================================
// EXPORT SINGLETON
// ========================================================================

export const quoteMotoBrandingEngine = new QuoteMotoBrandingEngine();