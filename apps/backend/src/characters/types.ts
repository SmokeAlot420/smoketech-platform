/**
 * Character Type Definitions for Ultra-Realistic Video Generation
 * Defines the interface that all character implementations must follow
 */

export interface Character {
  /**
   * Generate the base prompt for image generation
   * @param context - Context for the prompt (e.g., "professional headshot")
   * @returns Enhanced prompt string
   */
  generateBasePrompt(context?: string): string;

  /**
   * Get outfit variations for different content types
   * @returns Object mapping outfit type to description
   */
  getOutfitVariations?(): { [key: string]: string };

  /**
   * Generate branded settings for the character
   * @returns Array of setting descriptions
   */
  generateBrandedSettings?(): string[];

  /**
   * Character profile (optional for compatibility)
   */
  profile?: {
    name: string;
    profession: string;
    age: number;
    targetDemographic: string[];
    appearance: any;
    fashion: any;
    brand_elements: any;
    personality: any;
    insurance_expertise?: any;
  };

  /**
   * Character identity (optional for compatibility)
   */
  characterIdentity?: any;

  /**
   * Skin realism configuration (optional for compatibility)
   */
  skinConfig?: any;

  /**
   * Consistency anchors (optional for compatibility)
   */
  consistencyAnchors?: any;
}

/**
 * Extended character interface for ultra-realistic generation
 */
export interface UltraRealisticCharacter extends Character {
  /**
   * Validate if character is suitable for ultra-realistic generation
   */
  validateForRealism?(): { valid: boolean; issues: string[] };

  /**
   * Get optimized prompts for character consistency
   */
  getConsistencyPrompts?(): string[];

  /**
   * Get ZHO technique compatibility
   */
  getZhoCompatibility?(): string[];
}