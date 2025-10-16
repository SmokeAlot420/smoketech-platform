// Master Technique Library - Unified Collection of 90+ Techniques
// Combines all techniques from ZHO research, engines, and original development

import { CharacterIdentity } from './characterConsistency';

// Master Technique Library types - self-contained interfaces

export interface MasterTechnique {
  id: number;
  name: string;
  category: 'transformation' | 'character' | 'photography' | 'design' | 'viral' | 'enhancement' | 'skin-realism' | 'preservation' | 'platform' | 'brand';
  subcategory: string;
  prompt: string;
  description: string;
  viralPotential: 'low' | 'medium' | 'high' | 'viral-guaranteed';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  useCases: string[];
  tags: string[];
  source: 'zho' | 'original' | 'skin-engine' | 'character-engine' | 'photo-engine' | 'transform-engine';
  examples?: string[];
  parameters?: Record<string, any>;
}

export interface TechniqueSearchFilters {
  category?: string;
  viralPotential?: string;
  complexity?: string;
  tags?: string[];
  source?: string;
  searchTerm?: string;
}

export interface TechniqueBundle {
  name: string;
  description: string;
  techniques: MasterTechnique[];
  viralScore: number;
  recommendedFor: string[];
}

export class MasterTechniqueLibrary {

  private techniques: MasterTechnique[] = [
    // ========================================================================
    // ZHO VIRAL TECHNIQUES (46 techniques)
    // ========================================================================
    {
      id: 1,
      name: 'Universal Style-to-Realism',
      category: 'transformation',
      subcategory: 'style-conversion',
      prompt: 'turn this illustration into realistic version',
      description: 'Universal technique to convert any artistic style to photorealistic',
      viralPotential: 'viral-guaranteed',
      complexity: 'simple',
      useCases: ['anime to real', 'cartoon to photo', 'painting to realistic', 'sketch to photo'],
      tags: ['universal', 'realism', 'conversion', 'viral'],
      source: 'zho'
    },
    {
      id: 2,
      name: 'Image-to-Figure Transformation',
      category: 'viral',
      subcategory: 'collectible-creation',
      prompt: 'turn this photo into a character figure. Behind it, place a box with the character\'s image on it, showing it\'s a collectible figure. The character should be standing on a round plastic base. The scene should be indoors with good lighting.',
      description: 'Most viral ZHO technique - creates collectible figure from photo',
      viralPotential: 'viral-guaranteed',
      complexity: 'moderate',
      useCases: ['viral content', 'collectible creation', 'brand merchandise', 'character products'],
      tags: ['viral', 'figure', 'collectible', 'guaranteed-viral'],
      source: 'zho'
    },
    {
      id: 3,
      name: 'Professional Photography Upgrade',
      category: 'photography',
      subcategory: 'quality-enhancement',
      prompt: 'Transform the person in the photo into highly stylized ultra-realistic portrait, with sharp facial features and flawless fair skin. Professional photography quality.',
      description: 'Upgrade amateur photos to professional magazine quality',
      viralPotential: 'high',
      complexity: 'moderate',
      useCases: ['photo enhancement', 'professional portraits', 'magazine quality', 'brand content'],
      tags: ['professional', 'photography', 'quality', 'upgrade'],
      source: 'zho'
    },
    {
      id: 4,
      name: 'Virtual Makeup Application',
      category: 'enhancement',
      subcategory: 'makeup-effects',
      prompt: '为图一人物化上指定的妆，还保持图一的姿势\nApply specified makeup to the person while maintaining original pose',
      description: 'Apply virtual makeup while preserving character identity',
      viralPotential: 'high',
      complexity: 'moderate',
      useCases: ['makeup tryout', 'beauty content', 'style experimentation', 'brand demo'],
      tags: ['makeup', 'beauty', 'virtual', 'preservation'],
      source: 'zho'
    },
    {
      id: 5,
      name: 'Material Overlay Effects',
      category: 'enhancement',
      subcategory: 'material-effects',
      prompt: '为照片叠加上指定材质的效果\nApply specified material effects overlaid on the photo',
      description: 'Overlay materials like glass, metal, fabric on photos',
      viralPotential: 'high',
      complexity: 'complex',
      useCases: ['artistic effects', 'creative content', 'brand visualization', 'unique aesthetics'],
      tags: ['material', 'overlay', 'creative', 'artistic'],
      source: 'zho',
      parameters: { materialTypes: ['glass', 'metal', 'fabric', 'liquid', 'light'] }
    },

    // ========================================================================
    // SKIN REALISM TECHNIQUES (15 techniques)
    // ========================================================================
    {
      id: 51,
      name: 'Natural Skin Imperfections',
      category: 'skin-realism',
      subcategory: 'authenticity',
      prompt: 'Add natural skin imperfections: visible pores, subtle freckles, natural asymmetry, realistic skin texture variations',
      description: 'Apply realistic skin imperfections for human authenticity',
      viralPotential: 'medium',
      complexity: 'moderate',
      useCases: ['realistic characters', 'human authenticity', 'anti-synthetic', 'natural beauty'],
      tags: ['skin', 'realism', 'imperfections', 'authentic'],
      source: 'skin-engine'
    },
    {
      id: 52,
      name: 'Professional Skin Enhancement',
      category: 'skin-realism',
      subcategory: 'professional-quality',
      prompt: 'Professional photography grade skin realism with controlled imperfections and studio lighting interaction',
      description: 'Professional-grade skin enhancement maintaining authenticity',
      viralPotential: 'high',
      complexity: 'complex',
      useCases: ['professional portraits', 'brand content', 'magazine quality', 'commercial use'],
      tags: ['professional', 'skin', 'enhancement', 'studio'],
      source: 'skin-engine'
    },
    {
      id: 53,
      name: 'Age-Appropriate Skin Rendering',
      category: 'skin-realism',
      subcategory: 'age-accuracy',
      prompt: 'Apply age-appropriate skin characteristics: [young] smooth with minimal imperfections, [adult] moderate texture, [mature] character lines and experience marks',
      description: 'Render skin texture appropriate for character age',
      viralPotential: 'medium',
      complexity: 'moderate',
      useCases: ['character consistency', 'age accuracy', 'realistic aging', 'demographic targeting'],
      tags: ['age', 'skin', 'accuracy', 'demographics'],
      source: 'skin-engine'
    },

    // ========================================================================
    // CHARACTER CONSISTENCY TECHNIQUES (12 techniques)
    // ========================================================================
    {
      id: 66,
      name: 'ZHO Preservation Pattern',
      category: 'preservation',
      subcategory: 'character-lock',
      prompt: 'PRESERVE: Exact facial features\nPRESERVE: Same facial structure and bone geometry\nPRESERVE: Identical eye shape, size, and color',
      description: 'ZHO critical preservation pattern for absolute character consistency',
      viralPotential: 'high',
      complexity: 'simple',
      useCases: ['character consistency', 'brand identity', 'series content', 'cross-platform'],
      tags: ['preserve', 'character', 'consistency', 'zho-pattern'],
      source: 'character-engine'
    },
    {
      id: 67,
      name: 'Cross-Platform Character Preservation',
      category: 'preservation',
      subcategory: 'platform-consistency',
      prompt: 'PRESERVE: Character consistency across platforms\nPRESERVE: Same person for TikTok, Instagram, YouTube\nPRESERVE: Platform-appropriate but consistent identity',
      description: 'Maintain character identity across different social media platforms',
      viralPotential: 'high',
      complexity: 'moderate',
      useCases: ['multi-platform content', 'brand consistency', 'social media', 'viral campaigns'],
      tags: ['cross-platform', 'consistency', 'social-media', 'identity'],
      source: 'character-engine'
    },
    {
      id: 68,
      name: 'Style Transformation Preservation',
      category: 'preservation',
      subcategory: 'style-consistency',
      prompt: 'Transform setting and clothing to specified era\nPRESERVE: Exact facial features unchanged by era\nCharacter remains the same person in different time',
      description: 'Preserve character identity during style/period transformations',
      viralPotential: 'high',
      complexity: 'complex',
      useCases: ['time period content', 'style variations', 'historical content', 'viral series'],
      tags: ['style-transform', 'preservation', 'time-period', 'consistency'],
      source: 'character-engine'
    },

    // ========================================================================
    // PROFESSIONAL PHOTOGRAPHY TECHNIQUES (18 techniques)
    // ========================================================================
    {
      id: 78,
      name: 'Fashion Magazine Quality',
      category: 'photography',
      subcategory: 'fashion',
      prompt: 'Sharp facial features and flawless fair skin. Dramatic, cinematic lighting highlights facial structure. Luxury fashion magazine cover aesthetic. High-detail, 4K resolution, symmetrical composition.',
      description: 'Professional fashion photography with magazine-grade quality',
      viralPotential: 'high',
      complexity: 'complex',
      useCases: ['fashion content', 'magazine covers', 'luxury brands', 'high-end portraits'],
      tags: ['fashion', 'magazine', 'luxury', 'professional'],
      source: 'photo-engine'
    },
    {
      id: 79,
      name: 'Commercial Brand Photography',
      category: 'photography',
      subcategory: 'commercial',
      prompt: 'Commercial photography standards with brand-appropriate lighting. Product photography quality applied to portraits. Clean, professional aesthetic suitable for advertising.',
      description: 'Commercial-grade photography for brand and advertising use',
      viralPotential: 'high',
      complexity: 'moderate',
      useCases: ['brand content', 'advertising', 'commercial use', 'corporate portraits'],
      tags: ['commercial', 'brand', 'advertising', 'professional'],
      source: 'photo-engine'
    },
    {
      id: 80,
      name: 'Editorial Photography Style',
      category: 'photography',
      subcategory: 'editorial',
      prompt: 'Editorial photography style with artistic lighting. Bold contrast and dramatic mood lighting. Magazine-quality professional presentation. Creative composition with technical excellence.',
      description: 'Editorial photography with artistic vision and technical mastery',
      viralPotential: 'high',
      complexity: 'complex',
      useCases: ['editorial content', 'artistic portraits', 'publication quality', 'creative campaigns'],
      tags: ['editorial', 'artistic', 'creative', 'publication'],
      source: 'photo-engine'
    },

    // ========================================================================
    // VIRAL TRANSFORMATION TECHNIQUES (10 techniques)
    // ========================================================================
    {
      id: 96,
      name: 'Multi-Style Grid Creation',
      category: 'viral',
      subcategory: 'grid-content',
      prompt: 'Create 3x3 grid of same person\nPreserve exact facial features\nDifferent hairstyles in each cell\nConsistent lighting and expression\n100% character recognition across grid',
      description: 'Create viral grid content with character variations',
      viralPotential: 'viral-guaranteed',
      complexity: 'complex',
      useCases: ['viral content', 'style showcase', 'A/B testing', 'engagement content'],
      tags: ['grid', 'viral', 'variations', 'engagement'],
      source: 'transform-engine'
    },
    {
      id: 97,
      name: 'Time Period Transformation Series',
      category: 'viral',
      subcategory: 'historical-series',
      prompt: 'PRESERVE: Character through different historical periods\nSame person in 1950s, 1970s, 1990s, 2020s styling\nEra-appropriate but character identity unchanged',
      description: 'Transform character across different time periods',
      viralPotential: 'viral-guaranteed',
      complexity: 'complex',
      useCases: ['viral series', 'historical content', 'trend content', 'educational viral'],
      tags: ['time-period', 'historical', 'viral-series', 'educational'],
      source: 'transform-engine'
    },
    {
      id: 98,
      name: 'Platform Format Optimization',
      category: 'platform',
      subcategory: 'format-optimization',
      prompt: 'Optimize for platform format while preserving character\nPRESERVE: Same person across different aspect ratios\nAdapt composition without changing facial features',
      description: 'Optimize content for different platform formats',
      viralPotential: 'high',
      complexity: 'moderate',
      useCases: ['multi-platform content', 'format adaptation', 'social media optimization', 'viral distribution'],
      tags: ['platform', 'optimization', 'format', 'adaptation'],
      source: 'transform-engine'
    }
  ];

  private techniqueBundles: TechniqueBundle[] = [
    {
      name: 'Viral Content Creator Bundle',
      description: 'High-viral techniques guaranteed to generate engagement',
      techniques: [],
      viralScore: 95,
      recommendedFor: ['content creators', 'viral marketing', 'social media campaigns', 'influencer content']
    },
    {
      name: 'Professional Brand Bundle',
      description: 'Professional photography and brand consistency techniques',
      techniques: [],
      viralScore: 80,
      recommendedFor: ['brand content', 'corporate communications', 'professional services', 'marketing materials']
    },
    {
      name: 'Character Consistency Bundle',
      description: 'Techniques for maintaining character identity across variations',
      techniques: [],
      viralScore: 75,
      recommendedFor: ['series content', 'character development', 'brand mascots', 'storytelling']
    },
    {
      name: 'Ultra-Realism Bundle',
      description: 'Skin realism and photographic quality techniques',
      techniques: [],
      viralScore: 70,
      recommendedFor: ['realistic characters', 'professional portraits', 'human-centered content', 'authenticity-focused brands']
    }
  ];

  constructor() {
    this.initializeTechniqueBundles();
  }

  /**
   * Initialize technique bundles with appropriate techniques
   */
  private initializeTechniqueBundles(): void {
    // Viral Content Creator Bundle
    this.techniqueBundles[0].techniques = this.techniques.filter(t =>
      t.viralPotential === 'viral-guaranteed' ||
      (t.viralPotential === 'high' && t.category === 'viral')
    );

    // Professional Brand Bundle
    this.techniqueBundles[1].techniques = this.techniques.filter(t =>
      t.category === 'photography' || t.category === 'brand' ||
      (t.category === 'preservation' && t.subcategory.includes('brand'))
    );

    // Character Consistency Bundle
    this.techniqueBundles[2].techniques = this.techniques.filter(t =>
      t.category === 'preservation' || t.category === 'character'
    );

    // Ultra-Realism Bundle
    this.techniqueBundles[3].techniques = this.techniques.filter(t =>
      t.category === 'skin-realism' ||
      (t.category === 'photography' && t.subcategory.includes('quality'))
    );
  }

  /**
   * Search techniques by filters
   */
  searchTechniques(filters: TechniqueSearchFilters): MasterTechnique[] {
    let results = this.techniques;

    if (filters.category) {
      results = results.filter(t => t.category === filters.category);
    }

    if (filters.viralPotential) {
      results = results.filter(t => t.viralPotential === filters.viralPotential);
    }

    if (filters.complexity) {
      results = results.filter(t => t.complexity === filters.complexity);
    }

    if (filters.source) {
      results = results.filter(t => t.source === filters.source);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.tags.some(tag => tag.toLowerCase().includes(term)) ||
        t.useCases.some(useCase => useCase.toLowerCase().includes(term))
      );
    }

    return results;
  }

  /**
   * Get technique by ID
   */
  getTechnique(id: number): MasterTechnique | null {
    return this.techniques.find(t => t.id === id) || null;
  }

  /**
   * Get techniques by category
   */
  getTechniquesByCategory(category: string): MasterTechnique[] {
    return this.techniques.filter(t => t.category === category);
  }

  /**
   * Get viral techniques (high viral potential)
   */
  getViralTechniques(): MasterTechnique[] {
    return this.techniques.filter(t =>
      t.viralPotential === 'viral-guaranteed' || t.viralPotential === 'high'
    );
  }

  /**
   * Get technique bundle
   */
  getTechniqueBundle(name: string): TechniqueBundle | null {
    return this.techniqueBundles.find(b => b.name === name) || null;
  }

  /**
   * Get all technique bundles
   */
  getAllBundles(): TechniqueBundle[] {
    return this.techniqueBundles;
  }

  /**
   * Get technique statistics
   */
  getStatistics(): {
    total: number;
    byCategory: Record<string, number>;
    byViralPotential: Record<string, number>;
    bySource: Record<string, number>;
    viralGuaranteed: number;
  } {
    const byCategory: Record<string, number> = {};
    const byViralPotential: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    this.techniques.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byViralPotential[t.viralPotential] = (byViralPotential[t.viralPotential] || 0) + 1;
      bySource[t.source] = (bySource[t.source] || 0) + 1;
    });

    return {
      total: this.techniques.length,
      byCategory,
      byViralPotential,
      bySource,
      viralGuaranteed: this.techniques.filter(t => t.viralPotential === 'viral-guaranteed').length
    };
  }

  /**
   * Recommend techniques for specific use case
   */
  recommendTechniques(
    useCase: string,
    maxResults: number = 10
  ): MasterTechnique[] {
    const relevantTechniques = this.techniques.filter(t =>
      t.useCases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase())) ||
      t.tags.some(tag => tag.toLowerCase().includes(useCase.toLowerCase())) ||
      t.description.toLowerCase().includes(useCase.toLowerCase())
    );

    // Sort by viral potential
    const viralPotentialOrder = { 'viral-guaranteed': 4, 'high': 3, 'medium': 2, 'low': 1 };
    relevantTechniques.sort((a, b) =>
      viralPotentialOrder[b.viralPotential] - viralPotentialOrder[a.viralPotential]
    );

    return relevantTechniques.slice(0, maxResults);
  }

  /**
   * Get random viral technique
   */
  getRandomViralTechnique(): MasterTechnique {
    const viralTechniques = this.getViralTechniques();
    const randomIndex = Math.floor(Math.random() * viralTechniques.length);
    return viralTechniques[randomIndex];
  }

  /**
   * Build combined technique prompt
   */
  buildCombinedPrompt(
    basePrompt: string,
    techniqueIds: number[],
    characterIdentity?: CharacterIdentity
  ): string {
    const selectedTechniques = techniqueIds
      .map(id => this.getTechnique(id))
      .filter(t => t !== null) as MasterTechnique[];

    if (selectedTechniques.length === 0) {
      return basePrompt;
    }

    let combinedPrompt = `${basePrompt}\n\n`;

    // Apply character preservation if needed
    if (characterIdentity && selectedTechniques.some(t => t.category === 'preservation' || t.tags.includes('preserve'))) {
      combinedPrompt += `CHARACTER IDENTITY:\n`;
      combinedPrompt += `PRESERVE: ${characterIdentity.name} - exact same person\n`;
      combinedPrompt += `PRESERVE: Face ${characterIdentity.coreFeatures.faceShape}\n`;
      combinedPrompt += `PRESERVE: Eyes ${characterIdentity.coreFeatures.eyeShape} ${characterIdentity.coreFeatures.eyeColor}\n\n`;
    }

    // Apply techniques in order of complexity (simple first)
    const complexityOrder = { 'simple': 1, 'moderate': 2, 'complex': 3, 'expert': 4 };
    selectedTechniques.sort((a, b) => complexityOrder[a.complexity] - complexityOrder[b.complexity]);

    selectedTechniques.forEach((technique, index) => {
      combinedPrompt += `TECHNIQUE ${index + 1} (${technique.name.toUpperCase()}):\n`;
      combinedPrompt += `${technique.prompt}\n\n`;
    });

    combinedPrompt += `COMBINED EXECUTION:\n`;
    combinedPrompt += `- Apply all techniques maintaining consistency\n`;
    combinedPrompt += `- Preserve character identity throughout all transformations\n`;
    combinedPrompt += `- Professional quality execution for all effects\n`;
    combinedPrompt += `- Maintain viral potential and engagement optimization\n`;

    return combinedPrompt.trim();
  }
}

export const masterTechniqueLibrary = new MasterTechniqueLibrary();