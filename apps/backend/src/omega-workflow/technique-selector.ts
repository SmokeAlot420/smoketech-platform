/**
 * TECHNIQUE SELECTION ENGINE v1.0
 *
 * Intelligent selection system for 90+ techniques from MasterTechniqueLibrary
 * Optimizes viral potential while maintaining character preservation
 *
 * CORE FEATURES:
 * ✅ Viral Potential Optimization (80-95 target range)
 * ✅ Cost-Benefit Analysis
 * ✅ Character Preservation Priority #1
 * ✅ Platform-Specific Selection
 * ✅ Bundle Optimization
 * ✅ Performance Monitoring
 *
 * Sign off as SmokeDev 🚬
 */

import { MasterTechniqueLibrary, MasterTechnique, TechniqueBundle } from '../enhancement/masterTechniqueLibrary';
import { ZHOTechniquesEngine, ZHOTechnique } from '../enhancement/zhoTechniques';
import { CharacterIdentity } from '../enhancement/characterConsistency';

export interface SelectionCriteria {
  // Target Goals
  targetViralScore: number; // 80-95 range
  maxCost: number; // Budget constraint
  maxComplexity: 'simple' | 'moderate' | 'complex' | 'expert';

  // Platform Requirements
  targetPlatform: 'tiktok' | 'instagram' | 'youtube' | 'cross-platform';
  contentType: 'viral-transformation' | 'professional-brand' | 'character-series' | 'ultra-realistic';

  // Constraints
  characterPreservation: 'strict' | 'moderate' | 'flexible';
  timeConstraint: number; // Max processing time in minutes
  qualityLevel: 'viral-guaranteed' | 'professional' | 'standard';
}

export interface SelectionResult {
  selectedTechniques: MasterTechnique[];
  selectedBundles: TechniqueBundle[];
  zhoBonusTechniques: ZHOTechnique[];
  totalViralScore: number;
  estimatedCost: number;
  estimatedTime: number;
  reasoning: string[];
  alternatives: {
    technique: MasterTechnique;
    reason: string;
  }[];
}

export interface TechniqueAnalysis {
  technique: MasterTechnique;
  viralValue: number; // Viral score per dollar
  timeEfficiency: number; // Viral score per minute
  characterRisk: number; // Risk to character consistency (0-100)
  platformFit: number; // How well it fits target platform (0-100)
  synergy: number; // How well it combines with others (0-100)
  viralContribution?: number; // Direct viral score contribution
}

/**
 * Intelligent Technique Selection Engine
 *
 * Uses advanced algorithms to select optimal technique combinations
 * Prioritizes character preservation while maximizing viral potential
 */
export class TechniqueSelector {
  private masterLibrary: MasterTechniqueLibrary;
  private zhoEngine: ZHOTechniquesEngine;

  // Cost estimates per technique type (in cents)
  private readonly costMatrix = {
    'simple': 50,     // $0.50
    'moderate': 150,  // $1.50
    'complex': 300,   // $3.00
    'expert': 600     // $6.00
  };

  // Time estimates per technique type (in minutes)
  private readonly timeMatrix = {
    'simple': 2,
    'moderate': 5,
    'complex': 10,
    'expert': 20
  };

  // Platform optimization weights
  private readonly platformWeights = {
    tiktok: {
      viral: 1.5,        // Prioritize viral potential
      transformation: 1.3, // Visual transformations work well
      character: 0.8,    // Less character focus
      time: 0.6          // Shorter content preferred
    },
    instagram: {
      viral: 1.2,
      transformation: 1.1,
      character: 1.0,
      photography: 1.4,  // High-quality visuals
      time: 1.0
    },
    youtube: {
      viral: 1.0,
      transformation: 0.9,
      character: 1.3,    // Character development important
      brand: 1.2,        // Brand building
      time: 1.4          // Longer content acceptable
    },
    'cross-platform': {
      viral: 1.1,
      transformation: 1.0,
      character: 1.1,
      photography: 1.1,
      brand: 1.0,
      time: 1.0
    }
  };

  constructor() {
    this.masterLibrary = new MasterTechniqueLibrary();
    this.zhoEngine = new ZHOTechniquesEngine();
  }

  /**
   * Main selection method - selects optimal technique combination
   */
  async selectOptimalTechniques(
    criteria: SelectionCriteria,
    character: CharacterIdentity,
    basePrompt: string
  ): Promise<SelectionResult> {
    console.log('🧠 Starting intelligent technique selection...');
    console.log(`Target Viral Score: ${criteria.targetViralScore}`);
    console.log(`Max Cost: $${criteria.maxCost / 100} | Platform: ${criteria.targetPlatform}`);

    // Phase 1: Analyze base prompt for technique guidance
    const promptAnalysis = this.analyzeBasePrompt(basePrompt);
    console.log(`Base prompt analysis: ${promptAnalysis.style} style, ${promptAnalysis.complexity} complexity`);

    // Phase 2: Analyze all available techniques
    const techniques = this.masterLibrary.searchTechniques({}); // Get all techniques
    const bundles = this.masterLibrary.getAllBundles();
    const zhoTechniques = this.zhoEngine.getAllTechniques();

    // Phase 2: Analyze each technique for this specific scenario
    const analyses = await this.analyzeTechniques(techniques, criteria, character);

    // Phase 3: Bundle optimization analysis
    const bundleAnalyses = await this.analyzeBundles(bundles, criteria);

    // Phase 4: Apply selection algorithms
    const selection = await this.optimizeSelection(analyses, bundleAnalyses, criteria);

    // Phase 5: Add ZHO bonus techniques for viral boost
    const zhoBonuses = await this.selectZHOBonusTechniques(
      zhoTechniques,
      selection,
      criteria
    );

    const result = {
      selectedTechniques: selection.techniques,
      selectedBundles: selection.bundles,
      zhoBonusTechniques: zhoBonuses.techniques,
      totalViralScore: selection.viralScore + zhoBonuses.viralBoost,
      estimatedCost: selection.cost + zhoBonuses.cost,
      estimatedTime: selection.time + zhoBonuses.time,
      reasoning: [...selection.reasoning, ...zhoBonuses.reasoning],
      alternatives: selection.alternatives
    };

    console.log(`✅ Selection complete: ${result.selectedTechniques.length} techniques, ${result.selectedBundles.length} bundles`);
    console.log(`📊 Projected Viral Score: ${result.totalViralScore} | Cost: $${result.estimatedCost / 100} | Time: ${result.estimatedTime}min`);

    return result;
  }

  /**
   * Analyze individual techniques for this scenario
   */
  private async analyzeTechniques(
    techniques: MasterTechnique[],
    criteria: SelectionCriteria,
    character: CharacterIdentity
  ): Promise<TechniqueAnalysis[]> {
    const analyses: TechniqueAnalysis[] = [];

    for (const technique of techniques) {
      const cost = this.estimateCost(technique);
      const time = this.estimateTime(technique);

      const analysis: TechniqueAnalysis = {
        technique,
        viralValue: this.calculateViralValue(technique, cost),
        timeEfficiency: this.calculateTimeEfficiency(technique, time),
        characterRisk: this.assessCharacterRisk(technique, character, criteria.characterPreservation),
        platformFit: this.assessPlatformFit(technique, criteria.targetPlatform),
        synergy: 50 // Base synergy, will be calculated later
      };

      analyses.push(analysis);
    }

    // Calculate synergy scores between techniques
    this.calculateSynergyScores(analyses);

    return analyses;
  }

  /**
   * Analyze bundle efficiency
   */
  private async analyzeBundles(
    bundles: TechniqueBundle[],
    criteria: SelectionCriteria
  ): Promise<Array<{ bundle: TechniqueBundle; efficiency: number; fit: number }>> {
    return bundles.map(bundle => ({
      bundle,
      efficiency: this.calculateBundleEfficiency(bundle, criteria),
      fit: this.calculateBundleFit(bundle, criteria)
    }));
  }

  /**
   * Core optimization algorithm
   */
  private async optimizeSelection(
    analyses: TechniqueAnalysis[],
    bundleAnalyses: Array<{ bundle: TechniqueBundle; efficiency: number; fit: number }>,
    criteria: SelectionCriteria
  ): Promise<{
    techniques: MasterTechnique[];
    bundles: TechniqueBundle[];
    viralScore: number;
    cost: number;
    time: number;
    reasoning: string[];
    alternatives: { technique: MasterTechnique; reason: string }[];
  }> {
    const reasoning: string[] = [];
    const alternatives: { technique: MasterTechnique; reason: string }[] = [];

    // Strategy 1: Try bundle-first approach
    const bundleFirst = await this.bundleFirstOptimization(bundleAnalyses, analyses, criteria);

    // Strategy 2: Try individual technique optimization
    const individualFirst = await this.individualFirstOptimization(analyses, criteria);

    // Strategy 3: Try hybrid approach
    const hybrid = await this.hybridOptimization(bundleAnalyses, analyses, criteria);

    // Select best strategy
    const strategies = [
      { ...bundleFirst, name: 'Bundle-First' },
      { ...individualFirst, name: 'Individual-First' },
      { ...hybrid, name: 'Hybrid' }
    ];

    const bestStrategy = strategies
      .filter(s => s.viralScore >= criteria.targetViralScore && s.cost <= criteria.maxCost)
      .sort((a, b) => {
        // Primary: Higher viral score
        const viralDiff = b.viralScore - a.viralScore;
        if (Math.abs(viralDiff) > 5) return viralDiff;

        // Secondary: Lower cost
        return a.cost - b.cost;
      })[0];

    if (!bestStrategy) {
      reasoning.push('❌ No combination meets all criteria, selecting best available');
      const fallback = strategies.sort((a, b) => b.viralScore - a.viralScore)[0];
      reasoning.push(`📊 Selected ${fallback.name} strategy (viral: ${fallback.viralScore}, cost: $${fallback.cost / 100})`);
      return { ...fallback, reasoning, alternatives };
    }

    reasoning.push(`✅ Selected ${bestStrategy.name} strategy (optimal fit)`);
    reasoning.push(`📊 Viral Score: ${bestStrategy.viralScore}, Cost: $${bestStrategy.cost / 100}, Time: ${bestStrategy.time}min`);

    return { ...bestStrategy, reasoning, alternatives };
  }

  /**
   * Bundle-first optimization strategy
   */
  private async bundleFirstOptimization(
    bundleAnalyses: Array<{ bundle: TechniqueBundle; efficiency: number; fit: number }>,
    techniqueAnalyses: TechniqueAnalysis[],
    criteria: SelectionCriteria
  ): Promise<{
    techniques: MasterTechnique[];
    bundles: TechniqueBundle[];
    viralScore: number;
    cost: number;
    time: number;
  }> {
    // Sort bundles by efficiency and fit
    const sortedBundles = bundleAnalyses
      .sort((a, b) => (b.efficiency + b.fit) - (a.efficiency + a.fit));

    let totalViralScore = 0;
    let totalCost = 0;
    let totalTime = 0;
    const selectedBundles: TechniqueBundle[] = [];
    const usedTechniqueIds = new Set<number>();

    // Select best bundles that fit criteria
    for (const { bundle } of sortedBundles) {
      const bundleCost = this.estimateBundleCost(bundle);
      const bundleTime = this.estimateBundleTime(bundle);

      if (totalCost + bundleCost <= criteria.maxCost &&
          totalTime + bundleTime <= criteria.timeConstraint) {
        selectedBundles.push(bundle);
        totalViralScore += bundle.viralScore;
        totalCost += bundleCost;
        totalTime += bundleTime;

        // Mark techniques as used (simplified - bundles don't have technique IDs in our model)
      }
    }

    // Fill remaining capacity with individual techniques
    const remainingTechniques = techniqueAnalyses
      .filter(a => !usedTechniqueIds.has(a.technique.id))
      .sort((a, b) => (b.viralValue + b.platformFit) - (a.viralValue + a.platformFit));

    const selectedTechniques: MasterTechnique[] = [];

    for (const analysis of remainingTechniques) {
      const techCost = this.estimateCost(analysis.technique);
      const techTime = this.estimateTime(analysis.technique);

      if (totalCost + techCost <= criteria.maxCost &&
          totalTime + techTime <= criteria.timeConstraint &&
          analysis.characterRisk <= 30) { // Low character risk
        selectedTechniques.push(analysis.technique);
        totalViralScore += this.getViralScore(analysis.technique);
        totalCost += techCost;
        totalTime += techTime;
      }
    }

    return {
      techniques: selectedTechniques,
      bundles: selectedBundles,
      viralScore: totalViralScore,
      cost: totalCost,
      time: totalTime
    };
  }

  /**
   * Individual technique optimization strategy
   */
  private async individualFirstOptimization(
    analyses: TechniqueAnalysis[],
    criteria: SelectionCriteria
  ): Promise<{
    techniques: MasterTechnique[];
    bundles: TechniqueBundle[];
    viralScore: number;
    cost: number;
    time: number;
  }> {
    // Character preservation filtering
    const lowRiskTechniques = analyses.filter(a => {
      switch (criteria.characterPreservation) {
        case 'strict': return a.characterRisk <= 20;
        case 'moderate': return a.characterRisk <= 40;
        case 'flexible': return a.characterRisk <= 60;
        default: return true;
      }
    });

    // Sort by composite score
    const sortedTechniques = lowRiskTechniques.sort((a, b) => {
      const scoreA = (a.viralValue * 0.4) + (a.timeEfficiency * 0.3) + (a.platformFit * 0.3);
      const scoreB = (b.viralValue * 0.4) + (b.timeEfficiency * 0.3) + (b.platformFit * 0.3);
      return scoreB - scoreA;
    });

    let totalViralScore = 0;
    let totalCost = 0;
    let totalTime = 0;
    const selectedTechniques: MasterTechnique[] = [];

    // Greedy selection with constraints
    for (const analysis of sortedTechniques) {
      const techCost = this.estimateCost(analysis.technique);
      const techTime = this.estimateTime(analysis.technique);

      if (totalCost + techCost <= criteria.maxCost &&
          totalTime + techTime <= criteria.timeConstraint) {
        selectedTechniques.push(analysis.technique);
        totalViralScore += this.getViralScore(analysis.technique);
        totalCost += techCost;
        totalTime += techTime;

        // Stop if we hit target
        if (totalViralScore >= criteria.targetViralScore) break;
      }
    }

    return {
      techniques: selectedTechniques,
      bundles: [], // No bundles in individual-first strategy
      viralScore: totalViralScore,
      cost: totalCost,
      time: totalTime
    };
  }

  /**
   * Hybrid optimization strategy
   */
  private async hybridOptimization(
    bundleAnalyses: Array<{ bundle: TechniqueBundle; efficiency: number; fit: number }>,
    techniqueAnalyses: TechniqueAnalysis[],
    criteria: SelectionCriteria
  ): Promise<{
    techniques: MasterTechnique[];
    bundles: TechniqueBundle[];
    viralScore: number;
    cost: number;
    time: number;
  }> {
    // Start with the most efficient bundle
    const bestBundle = bundleAnalyses
      .sort((a, b) => (b.efficiency + b.fit) - (a.efficiency + a.fit))[0];

    let totalViralScore = 0;
    let totalCost = 0;
    let totalTime = 0;
    let selectedBundles: TechniqueBundle[] = [];

    if (bestBundle) {
      const bundleCost = this.estimateBundleCost(bestBundle.bundle);
      const bundleTime = this.estimateBundleTime(bestBundle.bundle);

      if (bundleCost <= criteria.maxCost && bundleTime <= criteria.timeConstraint) {
        selectedBundles = [bestBundle.bundle];
        totalViralScore += bestBundle.bundle.viralScore;
        totalCost += bundleCost;
        totalTime += bundleTime;
      }
    }

    // Fill remaining capacity with techniques
    const remainingBudget = criteria.maxCost - totalCost;
    const remainingTime = criteria.timeConstraint - totalTime;

    const viralGap = Math.max(0, criteria.targetViralScore - totalViralScore);

    // Filter and sort techniques for gap filling based on viral gap priority
    const gapFillers = techniqueAnalyses
      .filter(a => {
        const cost = this.estimateCost(a.technique);
        const time = this.estimateTime(a.technique);
        // Prioritize techniques that help close the viral gap
        const viralContribution = a.viralContribution || 0;
        return cost <= remainingBudget &&
               time <= remainingTime &&
               a.characterRisk <= 30 && // Safety margin
               viralContribution >= Math.min(5, viralGap * 0.2); // Must contribute meaningfully to gap
      })
      .sort((a, b) => {
        // Prioritize techniques that help close viral gap
        const viralContribA = this.getViralScore(a.technique);
        const viralContribB = this.getViralScore(b.technique);
        return viralContribB - viralContribA;
      });

    const selectedTechniques: MasterTechnique[] = [];

    for (const analysis of gapFillers) {
      const techCost = this.estimateCost(analysis.technique);
      const techTime = this.estimateTime(analysis.technique);

      if (totalCost + techCost <= criteria.maxCost &&
          totalTime + techTime <= criteria.timeConstraint) {
        selectedTechniques.push(analysis.technique);
        totalViralScore += this.getViralScore(analysis.technique);
        totalCost += techCost;
        totalTime += techTime;
      }
    }

    return {
      techniques: selectedTechniques,
      bundles: selectedBundles,
      viralScore: totalViralScore,
      cost: totalCost,
      time: totalTime
    };
  }

  /**
   * Select ZHO bonus techniques for viral boost
   */
  private async selectZHOBonusTechniques(
    zhoTechniques: ZHOTechnique[],
    currentSelection: any,
    criteria: SelectionCriteria
  ): Promise<{
    techniques: ZHOTechnique[];
    viralBoost: number;
    cost: number;
    time: number;
    reasoning: string[];
  }> {
    const reasoning: string[] = [];

    // Calculate remaining budget and viral gap
    const remainingBudget = criteria.maxCost - currentSelection.cost;
    const remainingTime = criteria.timeConstraint - currentSelection.time;
    const viralGap = Math.max(0, criteria.targetViralScore - currentSelection.viralScore);

    if (viralGap === 0) {
      reasoning.push('✅ Viral target already achieved, skipping ZHO bonuses');
      return { techniques: [], viralBoost: 0, cost: 0, time: 0, reasoning };
    }

    // Filter ZHO techniques by viral potential and platform fit
    const viralZHO = zhoTechniques
      .filter(t => t.viralPotential === 'high' && this.zhoFitsPlatform(t, criteria.targetPlatform))
      .sort((a, b) => this.zhoEstimateViralBoost(b) - this.zhoEstimateViralBoost(a));

    const selectedZHO: ZHOTechnique[] = [];
    let totalViralBoost = 0;
    let totalCost = 0;
    let totalTime = 0;

    for (const zho of viralZHO.slice(0, 2)) { // Max 2 ZHO techniques
      const zhoCost = 200; // $2.00 per ZHO technique
      const zhoTime = 3;   // 3 minutes per ZHO technique
      const zhoBoost = this.zhoEstimateViralBoost(zho);

      if (totalCost + zhoCost <= remainingBudget &&
          totalTime + zhoTime <= remainingTime) {
        selectedZHO.push(zho);
        totalViralBoost += zhoBoost;
        totalCost += zhoCost;
        totalTime += zhoTime;

        reasoning.push(`🚀 Added ZHO technique: ${zho.name} (+${zhoBoost} viral)`);
      }
    }

    return {
      techniques: selectedZHO,
      viralBoost: totalViralBoost,
      cost: totalCost,
      time: totalTime,
      reasoning
    };
  }

  // Helper methods for analysis and calculation

  private calculateViralValue(technique: MasterTechnique, cost: number): number {
    const viralScore = this.getViralScore(technique);
    return cost > 0 ? (viralScore / cost) * 100 : viralScore;
  }

  private calculateTimeEfficiency(technique: MasterTechnique, time: number): number {
    const viralScore = this.getViralScore(technique);
    return time > 0 ? viralScore / time : viralScore;
  }

  private assessCharacterRisk(
    technique: MasterTechnique,
    character: CharacterIdentity,
    preservationLevel: string
  ): number {
    let baseRisk = 30; // Default moderate risk

    // Assess risk based on technique category
    if (technique.category === 'transformation') baseRisk = 60;
    if (technique.category === 'viral') baseRisk = 40;
    if (technique.category === 'character') baseRisk = 10; // Character techniques preserve identity
    if (technique.category === 'enhancement') baseRisk = 20;

    // Adjust risk based on preservation level requirements
    let preservationMultiplier = 1.0;
    switch (preservationLevel) {
      case 'strict':
        preservationMultiplier = 1.5; // Higher risk assessment for strict preservation
        break;
      case 'moderate':
        preservationMultiplier = 1.0;
        break;
      case 'flexible':
        preservationMultiplier = 0.7; // Lower risk tolerance
        break;
    }

    // Adjust risk based on character complexity
    const characterComplexity = character.preserveIdentity ? 1.2 : 1.0;

    return Math.min(100, Math.round(baseRisk * preservationMultiplier * characterComplexity));
  }

  private assessPlatformFit(technique: MasterTechnique, platform: string): number {
    const weights = this.platformWeights[platform as keyof typeof this.platformWeights];
    if (!weights) return 50;

    let score = 50; // Base score

    // Apply platform-specific weights
    if (technique.category === 'viral' && weights.viral) {
      score += (weights.viral - 1) * 30;
    }
    if (technique.category === 'transformation' && weights.transformation) {
      score += (weights.transformation - 1) * 25;
    }
    if (technique.category === 'character' && weights.character) {
      score += (weights.character - 1) * 20;
    }
    if (technique.category === 'photography' && (weights as any).photography) {
      score += ((weights as any).photography - 1) * 25;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateSynergyScores(analyses: TechniqueAnalysis[]): void {
    // Simplified synergy calculation
    analyses.forEach(analysis => {
      analysis.synergy = 50 + Math.random() * 30; // 50-80 base synergy
    });
  }

  private calculateBundleEfficiency(bundle: TechniqueBundle, criteria: SelectionCriteria): number {
    const cost = this.estimateBundleCost(bundle);
    let baseEfficiency = cost > 0 ? (bundle.viralScore / cost) * 100 : bundle.viralScore;

    // Adjust efficiency based on criteria targets
    const viralGapBonus = bundle.viralScore >= criteria.targetViralScore ? 1.2 : 1.0;
    const platformBonus = bundle.recommendedFor.includes(criteria.targetPlatform) ? 1.1 : 1.0;
    const costFitBonus = cost <= criteria.maxCost ? 1.15 : 0.8;

    return baseEfficiency * viralGapBonus * platformBonus * costFitBonus;
  }

  private calculateBundleFit(bundle: TechniqueBundle, criteria: SelectionCriteria): number {
    // Check if bundle matches content type
    const contentType = criteria.contentType || 'general';
    const contentTypeMatch = bundle.name.toLowerCase().includes(contentType.split('-')[0]);
    const platformOptimized = bundle.recommendedFor.includes(criteria.targetPlatform);

    let fit = 50; // Base fit
    if (contentTypeMatch) fit += 30;
    if (platformOptimized) fit += 20;

    return Math.min(100, fit);
  }

  private estimateCost(technique: MasterTechnique): number {
    return this.costMatrix[technique.complexity] || 150;
  }

  private estimateTime(technique: MasterTechnique): number {
    return this.timeMatrix[technique.complexity] || 5;
  }

  private estimateBundleCost(bundle: TechniqueBundle): number {
    // Bundles have 20% discount
    const baseCost = bundle.techniques.length * 200; // Average technique cost
    return Math.floor(baseCost * 0.8);
  }

  private estimateBundleTime(bundle: TechniqueBundle): number {
    // Bundles are 30% more efficient
    const baseTime = bundle.techniques.length * 6; // Average technique time
    return Math.floor(baseTime * 0.7);
  }

  private getViralScore(technique: MasterTechnique): number {
    const viralScores = { low: 20, medium: 40, high: 60, 'viral-guaranteed': 85 };
    return viralScores[technique.viralPotential] || 40;
  }

  private zhoFitsPlatform(zho: ZHOTechnique, platform: string): boolean {
    // ZHO techniques generally work well on visual platforms
    if (platform === 'tiktok' || platform === 'instagram') return true;
    if (platform === 'youtube' && zho.viralPotential === 'high') return true;
    return platform === 'cross-platform';
  }

  private zhoEstimateViralBoost(zho: ZHOTechnique): number {
    const boosts = { low: 5, medium: 12, high: 20 };
    return boosts[zho.viralPotential] || 10;
  }

  /**
   * Quick preset selections for common scenarios
   */
  getPresetSelection(preset: 'max-viral' | 'cost-optimized' | 'brand-safe' | 'character-focused'): Partial<SelectionCriteria> {
    switch (preset) {
      case 'max-viral':
        return {
          targetViralScore: 95,
          maxCost: 5000, // $50
          maxComplexity: 'expert',
          characterPreservation: 'flexible',
          timeConstraint: 30
        };

      case 'cost-optimized':
        return {
          targetViralScore: 80,
          maxCost: 2000, // $20
          maxComplexity: 'moderate',
          characterPreservation: 'moderate',
          timeConstraint: 15
        };

      case 'brand-safe':
        return {
          targetViralScore: 85,
          maxCost: 3500, // $35
          maxComplexity: 'complex',
          characterPreservation: 'strict',
          timeConstraint: 25
        };

      case 'character-focused':
        return {
          targetViralScore: 82,
          maxCost: 3000, // $30
          maxComplexity: 'moderate',
          characterPreservation: 'strict',
          timeConstraint: 20
        };

      default:
        return {};
    }
  }

  /**
   * Analyze base prompt to guide technique selection
   */
  private analyzeBasePrompt(basePrompt: string): { style: string; complexity: string; keywords: string[] } {
    const lower = basePrompt.toLowerCase();

    // Determine style
    let style = 'photorealistic';
    if (lower.includes('cartoon') || lower.includes('anime')) style = 'stylized';
    if (lower.includes('professional') || lower.includes('editorial')) style = 'professional';
    if (lower.includes('artistic') || lower.includes('creative')) style = 'artistic';

    // Determine complexity
    let complexity = 'simple';
    if (basePrompt.length > 100) complexity = 'moderate';
    if (basePrompt.length > 200 || lower.includes('detailed') || lower.includes('complex')) complexity = 'complex';

    // Extract keywords
    const keywords = basePrompt.match(/\b\w{4,}\b/g) || [];

    return { style, complexity, keywords };
  }
}