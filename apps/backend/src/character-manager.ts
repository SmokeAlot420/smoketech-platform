/**
 * Character Manager - Maintains consistency across content generations
 * Ensures AI personas stay visually and behaviorally consistent
 */

export interface Character {
  id: string;
  name: string;
  referenceImages: string[];
  styleGuide: {
    appearance: string;
    clothing: string;
    personality: string;
    voiceTone?: string;
    signature?: string; // Unique visual element
  };
  metadata: {
    createdAt: Date;
    lastUsed: Date;
    totalContent: number;
    avgViralScore: number;
    bestPerformingStyle?: string;
  };
  usageHistory: ContentUsage[];
}

export interface ContentUsage {
  contentId: string;
  timestamp: Date;
  viralScore: number;
  images: string[];
  platform: string;
}

export class CharacterManager {
  private characters: Map<string, Character> = new Map();

  /**
   * Creates a new character profile from persona
   */
  async createCharacter(persona: any): Promise<Character> {
    const characterId = `char_${persona.name.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`;

    const character: Character = {
      id: characterId,
      name: persona.name,
      referenceImages: [],
      styleGuide: {
        appearance: this.generateAppearanceGuide(persona),
        clothing: this.generateClothingGuide(persona),
        personality: persona.personality || 'engaging',
        voiceTone: persona.tone || 'friendly',
        signature: this.generateSignatureElement(persona)
      },
      metadata: {
        createdAt: new Date(),
        lastUsed: new Date(),
        totalContent: 0,
        avgViralScore: 0
      },
      usageHistory: []
    };

    this.characters.set(characterId, character);
    return character;
  }

  /**
   * Retrieves existing character or creates new one
   */
  async getCharacter(characterId: string): Promise<Character | null> {
    return this.characters.get(characterId) || null;
  }

  /**
   * Updates character with new reference images
   */
  async addReferenceImages(
    characterId: string,
    images: string[]
  ): Promise<void> {
    const character = this.characters.get(characterId);
    if (!character) return;

    // Keep only the best reference images (max 5)
    character.referenceImages = [
      ...character.referenceImages,
      ...images
    ].slice(-5);

    character.metadata.lastUsed = new Date();
  }

  /**
   * Tracks content usage for consistency analysis
   */
  async updateUsageHistory(
    characterId: string,
    contentId: string,
    viralScore: number,
    images?: string[],
    platform?: string
  ): Promise<void> {
    const character = this.characters.get(characterId);
    if (!character) return;

    const usage: ContentUsage = {
      contentId,
      timestamp: new Date(),
      viralScore,
      images: images || [],
      platform: platform || 'unknown'
    };

    character.usageHistory.push(usage);

    // Update metadata
    character.metadata.totalContent++;
    character.metadata.lastUsed = new Date();
    character.metadata.avgViralScore = this.calculateAvgScore(character.usageHistory);

    // Learn from successful content
    if (viralScore > 80) {
      this.learnFromSuccess(character, usage);
    }

    // Maintain history limit
    if (character.usageHistory.length > 100) {
      character.usageHistory = character.usageHistory.slice(-100);
    }
  }

  /**
   * Calculates consistency score for character usage
   */
  async calculateConsistency(characterId: string): Promise<number> {
    const character = this.characters.get(characterId);
    if (!character || character.usageHistory.length < 2) {
      return 100; // New character starts at 100%
    }

    // Analyze recent content for consistency
    const recentUsage = character.usageHistory.slice(-10);
    let consistencyScore = 0;

    // Check visual consistency (simplified - in production would use image analysis)
    const hasReferenceImages = character.referenceImages.length > 0;
    if (hasReferenceImages) {
      consistencyScore += 40;
    }

    // Check style guide adherence
    if (character.styleGuide.signature) {
      consistencyScore += 30;
    }

    // Check performance consistency
    const scoreVariance = this.calculateScoreVariance(recentUsage);
    if (scoreVariance < 20) {
      consistencyScore += 30;
    }

    return Math.min(100, consistencyScore);
  }

  /**
   * Generates prompt additions for character consistency
   */
  getConsistencyPrompt(character: Character): string {
    const prompts: string[] = [];

    // Appearance consistency
    if (character.styleGuide.appearance) {
      prompts.push(character.styleGuide.appearance);
    }

    // Clothing consistency
    if (character.styleGuide.clothing) {
      prompts.push(`wearing ${character.styleGuide.clothing}`);
    }

    // Signature element
    if (character.styleGuide.signature) {
      prompts.push(`featuring ${character.styleGuide.signature}`);
    }

    // Personality expression
    if (character.styleGuide.personality) {
      prompts.push(`expressing ${character.styleGuide.personality} energy`);
    }

    return prompts.join(', ');
  }

  /**
   * Finds best performing character for a content type
   */
  async getBestPerformer(): Promise<Character | null> {
    let bestCharacter: Character | null = null;
    let bestScore = 0;

    for (const character of this.characters.values()) {
      if (character.metadata.avgViralScore > bestScore) {
        bestScore = character.metadata.avgViralScore;
        bestCharacter = character;
      }
    }

    return bestCharacter;
  }

  /**
   * Merges similar characters to maintain consistency
   */
  async mergeCharacters(
    primaryId: string,
    secondaryId: string
  ): Promise<Character | null> {
    const primary = this.characters.get(primaryId);
    const secondary = this.characters.get(secondaryId);

    if (!primary || !secondary) return null;

    // Merge reference images
    primary.referenceImages = [
      ...primary.referenceImages,
      ...secondary.referenceImages
    ].slice(-5);

    // Merge usage history
    primary.usageHistory = [
      ...primary.usageHistory,
      ...secondary.usageHistory
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Update metadata
    primary.metadata.totalContent += secondary.metadata.totalContent;
    primary.metadata.avgViralScore = this.calculateAvgScore(primary.usageHistory);

    // Remove secondary character
    this.characters.delete(secondaryId);

    return primary;
  }

  private generateAppearanceGuide(persona: any): string {
    const age = persona.age || '25-35';
    const style = persona.style || 'modern casual';
    const ethnicity = persona.ethnicity || 'diverse';

    return `${ethnicity} person aged ${age} with ${style} appearance`;
  }

  private generateClothingGuide(persona: any): string {
    const styles: Record<string, string> = {
      professional: 'business casual attire',
      casual: 'trendy streetwear',
      athletic: 'athletic wear',
      creative: 'artistic and unique outfit',
      tech: 'Silicon Valley casual'
    };

    return styles[persona.vibe] || 'modern casual clothing';
  }

  private generateSignatureElement(_persona: any): string {
    // Unique visual element for recognition
    const signatures = [
      'distinctive glasses',
      'colorful hair streak',
      'signature accessory',
      'unique hand gesture',
      'recognizable backdrop',
      'branded merchandise'
    ];

    return signatures[Math.floor(Math.random() * signatures.length)];
  }

  private calculateAvgScore(history: ContentUsage[]): number {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, usage) => acc + usage.viralScore, 0);
    return sum / history.length;
  }

  private calculateScoreVariance(history: ContentUsage[]): number {
    if (history.length < 2) return 0;
    const scores = history.map(u => u.viralScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - avg, 2), 0) / scores.length;
    return Math.sqrt(variance);
  }

  private learnFromSuccess(character: Character, usage: ContentUsage): void {
    // Learn from high-performing content
    if (!character.metadata.bestPerformingStyle) {
      character.metadata.bestPerformingStyle = `Style from content ${usage.contentId}`;
    }

    // Add successful images to references
    if (usage.images && usage.images.length > 0) {
      this.addReferenceImages(character.id, [usage.images[0]]);
    }
  }

  /**
   * Exports character for persistence
   */
  exportCharacter(characterId: string): string {
    const character = this.characters.get(characterId);
    if (!character) return '{}';
    return JSON.stringify(character, null, 2);
  }

  /**
   * Imports character from saved data
   */
  importCharacter(data: string): Character | null {
    try {
      const character = JSON.parse(data) as Character;
      character.metadata.createdAt = new Date(character.metadata.createdAt);
      character.metadata.lastUsed = new Date(character.metadata.lastUsed);
      character.usageHistory.forEach(usage => {
        usage.timestamp = new Date(usage.timestamp);
      });
      this.characters.set(character.id, character);
      return character;
    } catch (error) {
      console.error('Failed to import character:', error);
      return null;
    }
  }
}

export default CharacterManager;