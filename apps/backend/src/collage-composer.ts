/**
 * Collage Composer - Combines multiple reference images for better Nano Banana results
 * Based on YouTube guide: multiple images create better composition
 */

export interface CollageConfig {
  layout: 'grid' | 'horizontal' | 'vertical' | 'freestyle';
  maxImages: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  blendMode: 'normal' | 'overlay' | 'soft';
}

export class CollageComposer {
  private defaultConfig: CollageConfig = {
    layout: 'grid',
    maxImages: 4,
    aspectRatio: '9:16', // TikTok/Reels default
    blendMode: 'soft'
  };

  /**
   * Creates a collage prompt for Nano Banana
   * The last image in the array determines the output aspect ratio
   */
  async createCollage(
    images: string[],
    _googleMediaClient?: any, // Accept but don't use for now
    config: Partial<CollageConfig> = {}
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Limit images to prevent overwhelming the model
    const selectedImages = this.selectBestImages(images, finalConfig.maxImages);

    // Create collage instruction for Nano Banana
    const collagePrompt = this.buildCollagePrompt(selectedImages, finalConfig);

    return collagePrompt;
  }

  /**
   * Prepares images for optimal collage composition
   * Returns array with aspect ratio controller as last element
   */
  arrangeForComposition(
    referenceImages: string[],
    targetAspectRatio: string
  ): string[] {
    if (referenceImages.length === 0) return [];

    // Find image that best matches target aspect ratio
    const aspectRatioImage = this.findAspectRatioMatch(referenceImages, targetAspectRatio);

    // Arrange with aspect ratio controller last (Nano Banana rule)
    const otherImages = referenceImages.filter(img => img !== aspectRatioImage);
    return [...otherImages, aspectRatioImage];
  }

  /**
   * Creates smart combinations for A/B testing
   */
  generateCollageVariations(
    baseImages: string[],
    count: number = 3
  ): string[][] {
    const variations: string[][] = [];

    for (let i = 0; i < count; i++) {
      // Shuffle and select different combinations
      const shuffled = [...baseImages].sort(() => Math.random() - 0.5);
      const variation = shuffled.slice(0, Math.min(3 + i, baseImages.length));
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Enhances prompt for collage-based generation
   */
  enhancePromptForCollage(
    basePrompt: string,
    _imageCount: number
  ): string {
    const collageHints = [
      'seamlessly blend the reference elements',
      'create natural composition from the provided images',
      'combine the visual elements cohesively',
      'merge the reference materials into a unified scene'
    ];

    const hint = collageHints[Math.floor(Math.random() * collageHints.length)];

    return `${basePrompt}, ${hint}`;
  }

  private selectBestImages(images: string[], maxCount: number): string[] {
    // In production, would analyze images for quality/relevance
    // For now, take first N images
    return images.slice(0, maxCount);
  }

  private buildCollagePrompt(images: string[], config: CollageConfig): string {
    const layoutInstructions = {
      grid: 'arranged in a balanced grid',
      horizontal: 'arranged horizontally in sequence',
      vertical: 'stacked vertically',
      freestyle: 'artistically composed'
    };

    const instruction = layoutInstructions[config.layout];

    return `Composite image with ${images.length} reference elements ${instruction},
            ${config.aspectRatio} aspect ratio, ${config.blendMode} blending`;
  }

  private findAspectRatioMatch(images: string[], _targetRatio: string): string {
    // In production, would analyze actual image dimensions
    // For now, return last image (follows Nano Banana convention)
    return images[images.length - 1];
  }

  /**
   * Detects if images would cause "cardboard cutout" effect
   */
  detectCutoutRisk(prompt: string, images: string[]): boolean {
    const riskIndicators = [
      'standing',
      'holding',
      'posing',
      'static',
      'still'
    ];

    const hasStaticPrompt = riskIndicators.some(word =>
      prompt.toLowerCase().includes(word)
    );

    // Risk is high if static prompt with multiple images
    return hasStaticPrompt && images.length > 1;
  }

  /**
   * Suggests fixes for cutout effect
   */
  suggestCutoutFix(originalPrompt: string): string {
    const dynamicReplacements = {
      'standing': 'walking dynamically',
      'holding': 'reaching for',
      'posing': 'moving naturally',
      'static': 'in motion',
      'still': 'actively engaged'
    };

    let enhancedPrompt = originalPrompt;
    for (const [staticWord, dynamic] of Object.entries(dynamicReplacements)) {
      enhancedPrompt = enhancedPrompt.replace(
        new RegExp(staticWord, 'gi'),
        dynamic
      );
    }

    // Add motion if none exists
    if (enhancedPrompt === originalPrompt) {
      enhancedPrompt += ', with natural movement and dynamic energy';
    }

    return enhancedPrompt;
  }
}

export default CollageComposer;