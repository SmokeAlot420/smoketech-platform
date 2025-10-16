/**
 * Variation Generator - Creates multiple versions for A/B testing
 * Implements "shotgun approach" from YouTube guide for finding viral winners
 */

import { GoogleMediaClient } from './google-media-client';
import { MotionPrompter } from './motion-prompter';
import { CollageComposer } from './collage-composer';

export interface VariationStrategy {
  type: 'motion' | 'style' | 'composition' | 'timing' | 'all';
  count: number;
  budget: number;
}

export interface ContentVariation {
  id: string;
  variationType: string;
  changes: string[];
  images: string[];
  video?: string;
  cost: number;
  testGroup: string;
}

export class VariationGenerator {
  private googleMediaClient: GoogleMediaClient;
  private motionPrompter: MotionPrompter;
  private collageComposer: CollageComposer;

  constructor() {
    // These will be injected from parent
    this.googleMediaClient = null as any;
    this.motionPrompter = new MotionPrompter();
    this.collageComposer = new CollageComposer();
  }

  setGoogleMediaClient(client: GoogleMediaClient) {
    this.googleMediaClient = client;
  }

  /**
   * Generates multiple variations for A/B testing
   */
  async generateVariations(
    baseScript: string,
    baseImages: string[],
    params: any
  ): Promise<{ variations: ContentVariation[]; totalCost: number }> {
    const strategy: VariationStrategy = {
      type: params.variationStrategy || 'all',
      count: params.variationCount || 3,
      budget: params.variationBudget || 5.0
    };

    const variations: ContentVariation[] = [];
    let totalCost = 0;

    // Generate variations based on strategy
    switch (strategy.type) {
      case 'motion':
        const motionVars = await this.createMotionVariations(baseScript, baseImages, strategy.count);
        variations.push(...motionVars.variations);
        totalCost += motionVars.cost;
        break;

      case 'style':
        const styleVars = await this.createStyleVariations(baseScript, baseImages, strategy.count);
        variations.push(...styleVars.variations);
        totalCost += styleVars.cost;
        break;

      case 'composition':
        const compVars = await this.createCompositionVariations(baseImages, baseScript, strategy.count);
        variations.push(...compVars.variations);
        totalCost += compVars.cost;
        break;

      case 'timing':
        const timingVars = await this.createTimingVariations(baseScript, baseImages, strategy.count);
        variations.push(...timingVars.variations);
        totalCost += timingVars.cost;
        break;

      case 'all':
      default:
        // Create one of each type
        const allTypes = ['motion', 'style', 'composition'];
        for (let i = 0; i < strategy.count; i++) {
          const varType = allTypes[i % allTypes.length];
          const result = await this.createSingleVariation(varType, baseScript, baseImages, i);
          variations.push(result.variation);
          totalCost += result.cost;

          // Stop if budget exceeded
          if (totalCost > strategy.budget) {
            break;
          }
        }
    }

    return { variations, totalCost };
  }

  /**
   * Creates variations with different motion styles
   */
  private async createMotionVariations(
    script: string,
    _images: string[],
    count: number
  ): Promise<{ variations: ContentVariation[]; cost: number }> {
    const variations: ContentVariation[] = [];
    let cost = 0;

    const motionStyles = ['subtle', 'moderate', 'dynamic', 'extreme'];

    for (let i = 0; i < count; i++) {
      const motionStyle = motionStyles[i % motionStyles.length];
      const variationId = `var_motion_${Date.now()}_${i}`;

      // Create motion-enhanced prompt
      const enhancedPrompt = await this.motionPrompter.enhancePrompt(
        script,
        undefined,
        { intensity: motionStyle as any }
      );

      // Generate new image with motion style
      const result = await this.googleMediaClient.generateImageNanoBanana({
        prompt: enhancedPrompt,
        negativePrompt: 'static, blurry'
      });
      const variantImage = result.url;

      variations.push({
        id: variationId,
        variationType: 'motion',
        changes: [`Applied ${motionStyle} motion style`],
        images: [variantImage],
        cost: 0.039,
        testGroup: `motion_${motionStyle}`
      });

      cost += 0.039;
    }

    return { variations, cost };
  }

  /**
   * Creates variations with different visual styles
   */
  private async createStyleVariations(
    script: string,
    _images: string[],
    count: number
  ): Promise<{ variations: ContentVariation[]; cost: number }> {
    const variations: ContentVariation[] = [];
    let cost = 0;

    const styles = [
      { name: 'cinematic', prompt: 'cinematic lighting, film grain, letterbox' },
      { name: 'vibrant', prompt: 'bright colors, high saturation, energetic' },
      { name: 'moody', prompt: 'dramatic shadows, low key lighting, atmospheric' },
      { name: 'retro', prompt: 'vintage filter, nostalgic, film photography' }
    ];

    for (let i = 0; i < count; i++) {
      const style = styles[i % styles.length];
      const variationId = `var_style_${Date.now()}_${i}`;

      // Apply style modifications
      const styledPrompt = `${script}, ${style.prompt}`;

      const result = await this.googleMediaClient.generateImageNanoBanana({
        prompt: styledPrompt,
        aspectRatio: '16:9'
      });
      const variantImage = result.url;

      variations.push({
        id: variationId,
        variationType: 'style',
        changes: [`Applied ${style.name} visual style`],
        images: [variantImage],
        cost: 0.039,
        testGroup: `style_${style.name}`
      });

      cost += 0.039;
    }

    return { variations, cost };
  }

  /**
   * Creates variations with different image compositions
   */
  private async createCompositionVariations(
    images: string[],
    script: string,
    count: number
  ): Promise<{ variations: ContentVariation[]; cost: number }> {
    const variations: ContentVariation[] = [];
    let cost = 0;

    // Generate different collage combinations
    const collageVariations = this.collageComposer.generateCollageVariations(images, count);

    for (let i = 0; i < collageVariations.length; i++) {
      const variationId = `var_comp_${Date.now()}_${i}`;
      const collageImages = collageVariations[i];

      // Create collage with different arrangements
      const collagePrompt = this.collageComposer.enhancePromptForCollage(
        script,
        collageImages.length
      );

      const result = await this.googleMediaClient.generateImageNanoBanana({
        prompt: collagePrompt,
        aspectRatio: '16:9'
      });
      const variantImage = result.url;

      variations.push({
        id: variationId,
        variationType: 'composition',
        changes: [`Created collage with ${collageImages.length} images`],
        images: [variantImage],
        cost: 0.039,
        testGroup: `comp_${collageImages.length}img`
      });

      cost += 0.039;
    }

    return { variations, cost };
  }

  /**
   * Creates variations with different video timings/durations
   */
  private async createTimingVariations(
    _script: string,
    images: string[],
    count: number
  ): Promise<{ variations: ContentVariation[]; cost: number }> {
    const variations: ContentVariation[] = [];
    let cost = 0;

    const timings = [
      { duration: 5, pace: 'quick', cost: 1.20 },
      { duration: 7, pace: 'medium', cost: 3.20 },
      { duration: 10, pace: 'extended', cost: 3.20 }
    ];

    for (let i = 0; i < count; i++) {
      const timing = timings[i % timings.length];
      const variationId = `var_timing_${Date.now()}_${i}`;

      // For now, just track the timing variation
      // Video generation happens later in the pipeline
      variations.push({
        id: variationId,
        variationType: 'timing',
        changes: [`${timing.duration}s ${timing.pace} pace video`],
        images: images.slice(0, 1),
        cost: 0, // Video cost calculated separately
        testGroup: `timing_${timing.duration}s`
      });
    }

    return { variations, cost };
  }

  /**
   * Creates a single variation of specified type
   */
  private async createSingleVariation(
    type: string,
    script: string,
    images: string[],
    index: number
  ): Promise<{ variation: ContentVariation; cost: number }> {
    switch (type) {
      case 'motion':
        const motionResult = await this.createMotionVariations(script, images, 1);
        return { variation: motionResult.variations[0], cost: motionResult.cost };

      case 'style':
        const styleResult = await this.createStyleVariations(script, images, 1);
        return { variation: styleResult.variations[0], cost: styleResult.cost };

      case 'composition':
        const compResult = await this.createCompositionVariations(images, script, 1);
        return { variation: compResult.variations[0], cost: compResult.cost };

      default:
        // Default variation
        return {
          variation: {
            id: `var_default_${Date.now()}_${index}`,
            variationType: 'baseline',
            changes: ['No changes - baseline version'],
            images: images.slice(0, 1),
            cost: 0,
            testGroup: 'baseline'
          },
          cost: 0
        };
    }
  }

  /**
   * Analyzes variation performance to find winners
   */
  analyzeVariationPerformance(
    variations: ContentVariation[],
    metrics: Map<string, any>
  ): {
    winner: ContentVariation | null;
    insights: string[];
  } {
    let winner: ContentVariation | null = null;
    let bestScore = 0;
    const insights: string[] = [];

    // Analyze by variation type
    const typePerformance = new Map<string, number[]>();

    for (const variation of variations) {
      const metric = metrics.get(variation.id);
      if (!metric) continue;

      const score = metric.viralScore || 0;

      // Track best performer
      if (score > bestScore) {
        bestScore = score;
        winner = variation;
      }

      // Group by type
      if (!typePerformance.has(variation.variationType)) {
        typePerformance.set(variation.variationType, []);
      }
      typePerformance.get(variation.variationType)!.push(score);
    }

    // Generate insights
    for (const [type, scores] of typePerformance.entries()) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      insights.push(`${type} variations averaged ${avg.toFixed(1)} viral score`);

      if (avg > 70) {
        insights.push(`✨ ${type} variations show strong performance!`);
      }
    }

    if (winner) {
      insights.push(`🏆 Winner: ${winner.variationType} variation with score ${bestScore}`);
      insights.push(`Changes that worked: ${winner.changes.join(', ')}`);
    }

    return { winner, insights };
  }

  /**
   * Suggests next variations based on performance
   */
  suggestNextVariations(
    winner: ContentVariation,
    _allVariations: ContentVariation[]
  ): string[] {
    const suggestions: string[] = [];

    // Double down on winning type
    suggestions.push(`Create more ${winner.variationType} variations`);

    // Combine winning elements
    if (winner.changes.length > 0) {
      suggestions.push(`Combine: ${winner.changes[0]} with other top performers`);
    }

    // Test extremes of winning approach
    if (winner.variationType === 'motion') {
      suggestions.push('Test even more dynamic motion styles');
    } else if (winner.variationType === 'style') {
      suggestions.push('Push the winning style further');
    }

    // A/B test specific elements
    suggestions.push(`Isolate and test: ${winner.testGroup} elements individually`);

    return suggestions;
  }
}

export default VariationGenerator;