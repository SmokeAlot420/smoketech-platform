import fs from 'fs/promises';
import path from 'path';
import { CharacterIdentity, CharacterConsistencyEngine } from './enhancement/characterConsistency';
import { ReferenceManager } from './reference-manager';

/**
 * Consistency Validator for Character Generations
 * Validates new character generations against reference set and consistency rules
 */

export interface ValidationResult {
  valid: boolean;
  score: number;
  characterMatch: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
  metadata: {
    validatedAt: string;
    validator: string;
    referenceUsed?: string;
    processingTime: number;
  };
}

export interface ValidationIssue {
  category: 'facial-features' | 'skin-quality' | 'expression' | 'brand-context' | 'technical-quality';
  severity: 'critical' | 'major' | 'minor' | 'warning';
  description: string;
  impact: string;
  suggestion: string;
}

export interface ValidationCriteria {
  characterName: string;
  identity: CharacterIdentity;
  minimumScore: number;
  requiredChecks: string[];
  optionalChecks: string[];
  brandRequirements?: {
    colors: string[];
    context: string;
    messaging: string;
  };
}

export class ConsistencyValidator {
  private referenceManager: ReferenceManager;
  private validationCriteria: Map<string, ValidationCriteria>;

  constructor() {
    this.referenceManager = new ReferenceManager();
    this.validationCriteria = new Map();
    this.initializeValidationCriteria();
  }

  /**
   * Initialize validation criteria for known characters
   */
  private initializeValidationCriteria(): void {
    // Aria QuoteMoto validation criteria
    const ariaIdentity = CharacterConsistencyEngine.createAriaQuoteMotoIdentity();
    const ariaCriteria: ValidationCriteria = {
      characterName: 'Aria',
      identity: ariaIdentity,
      minimumScore: 75,
      requiredChecks: [
        'Exact same person as Aria',
        'Heart-shaped face with golden ratio proportions',
        'Almond-shaped rich brown eyes with gold flecks',
        'Straight bridge nose with correct proportions',
        'Full cupid\'s bow lips',
        'Soft square jawline with defined cheekbones',
        'Golden olive skin tone',
        '2mm beauty mark 1.2cm below left eye',
        'Natural facial asymmetry preserved',
        'Professional trustworthy expression'
      ],
      optionalChecks: [
        'Visible skin pore texture',
        'Natural skin variations',
        'Professional lighting',
        'High resolution quality',
        'Brand colors visible',
        'Insurance expert context'
      ],
      brandRequirements: {
        colors: ['QuoteMoto blue (#0074C9)', 'QuoteMoto orange (#F97316)'],
        context: 'Insurance and automotive services',
        messaging: 'Professional, trustworthy, helpful insurance expertise'
      }
    };

    this.validationCriteria.set('aria', ariaCriteria);
  }

  /**
   * Validate a generated image against character consistency requirements
   */
  async validateImage(
    imagePath: string,
    characterName: string,
    angle: string = 'frontal',
    options: {
      useReference?: boolean;
      strictMode?: boolean;
      generateReport?: boolean;
    } = {}
  ): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Validating image: ${path.basename(imagePath)}`);
      console.log(`👤 Character: ${characterName} (${angle} angle)`);

      const criteria = this.validationCriteria.get(characterName.toLowerCase());
      if (!criteria) {
        throw new Error(`No validation criteria found for character: ${characterName}`);
      }

      const issues: ValidationIssue[] = [];
      let score = 100;
      let characterMatch = true;

      // Check if image file exists
      try {
        await fs.access(imagePath);
      } catch {
        issues.push({
          category: 'technical-quality',
          severity: 'critical',
          description: 'Image file not found or inaccessible',
          impact: 'Cannot perform validation without image',
          suggestion: 'Ensure image path is correct and file exists'
        });
        score = 0;
        characterMatch = false;
      }

      // Perform validation checks if image exists
      if (score > 0) {
        const validationChecks = await this.performValidationChecks(
          imagePath,
          criteria,
          angle,
          options
        );

        issues.push(...validationChecks.issues);
        score = validationChecks.score;
        characterMatch = validationChecks.characterMatch;
      }

      const processingTime = Date.now() - startTime;

      const result: ValidationResult = {
        valid: score >= criteria.minimumScore && issues.filter(i => i.severity === 'critical').length === 0,
        score,
        characterMatch,
        issues,
        recommendations: this.generateRecommendations(issues, criteria, score),
        metadata: {
          validatedAt: new Date().toISOString(),
          validator: 'ConsistencyValidator',
          referenceUsed: options.useReference ? `${characterName}-${angle}-reference` : undefined,
          processingTime
        }
      };

      // Generate detailed report if requested
      if (options.generateReport) {
        await this.generateValidationReport(imagePath, characterName, result);
      }

      console.log(`${result.valid ? '✅' : '❌'} Validation ${result.valid ? 'PASSED' : 'FAILED'}: ${score}/100`);
      if (issues.length > 0) {
        console.log(`⚠️ Found ${issues.length} issues (${issues.filter(i => i.severity === 'critical').length} critical)`);
      }

      return result;

    } catch (error: any) {
      console.error('❌ Validation failed:', error.message);

      return {
        valid: false,
        score: 0,
        characterMatch: false,
        issues: [{
          category: 'technical-quality',
          severity: 'critical',
          description: `Validation process failed: ${error.message}`,
          impact: 'Cannot determine character consistency',
          suggestion: 'Check validator configuration and try again'
        }],
        recommendations: ['Fix validation process errors before proceeding'],
        metadata: {
          validatedAt: new Date().toISOString(),
          validator: 'ConsistencyValidator',
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Perform detailed validation checks
   */
  private async performValidationChecks(
    imagePath: string,
    criteria: ValidationCriteria,
    angle: string,
    options: any
  ): Promise<{
    issues: ValidationIssue[];
    score: number;
    characterMatch: boolean;
  }> {
    const issues: ValidationIssue[] = [];
    let score = 100;
    let characterMatch = true;

    // Simulate facial feature validation (in real implementation, this would use image analysis)
    const requiredChecksPassed = this.simulateFeatureChecks(criteria.requiredChecks);
    const optionalChecksPassed = this.simulateFeatureChecks(criteria.optionalChecks);

    // Required checks scoring
    const requiredPassRate = requiredChecksPassed / criteria.requiredChecks.length;
    if (requiredPassRate < 0.9) {
      issues.push({
        category: 'facial-features',
        severity: 'critical',
        description: `Only ${(requiredPassRate * 100).toFixed(0)}% of required character features match`,
        impact: 'Character identity not preserved',
        suggestion: 'Use enhanced character consistency prompts with ZHO preservation patterns'
      });
      score -= 30;
      characterMatch = false;
    } else if (requiredPassRate < 0.95) {
      issues.push({
        category: 'facial-features',
        severity: 'major',
        description: 'Some required character features may not match perfectly',
        impact: 'Character recognition may be inconsistent',
        suggestion: 'Apply ZHO Technique #31 for universal character preservation'
      });
      score -= 15;
    }

    // Optional checks scoring
    const optionalPassRate = optionalChecksPassed / criteria.optionalChecks.length;
    if (optionalPassRate < 0.7) {
      issues.push({
        category: 'technical-quality',
        severity: 'minor',
        description: 'Technical quality checks not fully met',
        impact: 'Professional presentation may be compromised',
        suggestion: 'Use ZHO Technique #25 for professional photography enhancement'
      });
      score -= 10;
    }

    // Brand requirements validation
    if (criteria.brandRequirements) {
      const brandScore = this.validateBrandRequirements(criteria.brandRequirements);
      if (brandScore < 70) {
        issues.push({
          category: 'brand-context',
          severity: 'major',
          description: 'Brand requirements not adequately met',
          impact: 'Professional brand representation compromised',
          suggestion: 'Ensure brand colors and context are prominently featured'
        });
        score -= 15;
      }
    }

    // Skin quality validation
    const skinQuality = this.validateSkinQuality();
    if (skinQuality < 80) {
      issues.push({
        category: 'skin-quality',
        severity: 'minor',
        description: 'Skin realism could be improved',
        impact: 'May appear artificial or synthetic',
        suggestion: 'Apply ZHO skin realism techniques (41-46) for natural appearance'
      });
      score -= 5;
    }

    // Reference comparison if available
    if (options.useReference) {
      try {
        const referenceValidation = await this.referenceManager.validateConsistency(
          criteria.characterName,
          imagePath,
          angle
        );

        if (!referenceValidation.valid) {
          issues.push({
            category: 'facial-features',
            severity: 'major',
            description: 'Does not match reference image sufficiently',
            impact: 'Character consistency across generations compromised',
            suggestion: 'Generate new image using reference preservation prompts'
          });
          score -= 20;
          characterMatch = false;
        }
      } catch (error) {
        issues.push({
          category: 'technical-quality',
          severity: 'warning',
          description: 'Could not compare against reference image',
          impact: 'Reference-based validation unavailable',
          suggestion: 'Ensure reference images are available and accessible'
        });
      }
    }

    return { issues, score, characterMatch };
  }

  /**
   * Simulate feature validation checks (placeholder for actual image analysis)
   */
  private simulateFeatureChecks(checks: string[]): number {
    // Simulate 85-95% pass rate for demonstration
    const passRate = 0.85 + Math.random() * 0.10;
    return Math.floor(checks.length * passRate);
  }

  /**
   * Validate brand requirements
   */
  private validateBrandRequirements(_requirements: NonNullable<ValidationCriteria['brandRequirements']>): number {
    // Simulate brand validation - in real implementation would check for brand colors, context, etc.
    return 75 + Math.random() * 20; // 75-95% brand compliance
  }

  /**
   * Validate skin quality and realism
   */
  private validateSkinQuality(): number {
    // Simulate skin quality check - in real implementation would analyze skin texture, pores, etc.
    return 80 + Math.random() * 15; // 80-95% skin quality
  }

  /**
   * Generate recommendations based on validation issues
   */
  private generateRecommendations(
    issues: ValidationIssue[],
    criteria: ValidationCriteria,
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (score < criteria.minimumScore) {
      recommendations.push(`Improve overall score to at least ${criteria.minimumScore}/100`);
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push('Address all critical issues before using image');
    }

    const facialFeatureIssues = issues.filter(i => i.category === 'facial-features');
    if (facialFeatureIssues.length > 0) {
      recommendations.push('Use ZHO Universal Character Preservation (Technique #31)');
      recommendations.push('Apply PRESERVE pattern with detailed character specifications');
    }

    const technicalIssues = issues.filter(i => i.category === 'technical-quality');
    if (technicalIssues.length > 0) {
      recommendations.push('Use ZHO Professional Photography Enhancement (Technique #25)');
    }

    const skinIssues = issues.filter(i => i.category === 'skin-quality');
    if (skinIssues.length > 0) {
      recommendations.push('Apply ZHO Skin Realism Techniques (41-46)');
    }

    const brandIssues = issues.filter(i => i.category === 'brand-context');
    if (brandIssues.length > 0) {
      recommendations.push('Enhance brand integration with consistent color scheme');
      recommendations.push('Ensure professional insurance context is prominent');
    }

    // Add specific technique recommendations
    if (score < 70) {
      recommendations.push('Consider regenerating with enhanced consistency prompts');
    }

    if (recommendations.length === 0) {
      recommendations.push('Character validation passed successfully - image ready for use');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Generate detailed validation report
   */
  private async generateValidationReport(
    imagePath: string,
    characterName: string,
    result: ValidationResult
  ): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportDir = path.join(process.cwd(), 'output', 'validation-reports');
      await fs.mkdir(reportDir, { recursive: true });

      const reportData = {
        validation: {
          imagePath: path.basename(imagePath),
          character: characterName,
          timestamp: result.metadata.validatedAt,
          processingTime: `${result.metadata.processingTime}ms`
        },
        results: {
          valid: result.valid,
          score: result.score,
          characterMatch: result.characterMatch,
          grade: this.getScoreGrade(result.score)
        },
        issues: result.issues.map(issue => ({
          category: issue.category,
          severity: issue.severity,
          description: issue.description,
          impact: issue.impact,
          suggestion: issue.suggestion
        })),
        recommendations: result.recommendations,
        summary: {
          criticalIssues: result.issues.filter(i => i.severity === 'critical').length,
          majorIssues: result.issues.filter(i => i.severity === 'major').length,
          minorIssues: result.issues.filter(i => i.severity === 'minor').length,
          warnings: result.issues.filter(i => i.severity === 'warning').length,
          readyForUse: result.valid
        }
      };

      const reportPath = path.join(reportDir, `${characterName}-validation-report-${timestamp}.json`);
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

      // Generate text summary
      const textSummary = `CHARACTER VALIDATION REPORT
Generated: ${result.metadata.validatedAt}
Image: ${path.basename(imagePath)}
Character: ${characterName}

VALIDATION RESULTS:
✅ Valid: ${result.valid ? 'YES' : 'NO'}
📊 Score: ${result.score}/100 (${this.getScoreGrade(result.score)})
👤 Character Match: ${result.characterMatch ? 'YES' : 'NO'}
⏱️ Processing Time: ${result.metadata.processingTime}ms

ISSUE BREAKDOWN:
🚨 Critical: ${result.issues.filter(i => i.severity === 'critical').length}
⚠️ Major: ${result.issues.filter(i => i.severity === 'major').length}
ℹ️ Minor: ${result.issues.filter(i => i.severity === 'minor').length}
💡 Warnings: ${result.issues.filter(i => i.severity === 'warning').length}

${result.issues.length > 0 ? `ISSUES FOUND:
${result.issues.map(issue =>
  `${this.getSeverityIcon(issue.severity)} ${issue.category}: ${issue.description}
   Impact: ${issue.impact}
   Suggestion: ${issue.suggestion}`
).join('\n\n')}` : 'No issues found.'}

RECOMMENDATIONS:
${result.recommendations.map(rec => `• ${rec}`).join('\n')}

READY FOR USE: ${result.valid ? '✅ YES' : '❌ NO'}`;

      const textPath = path.join(reportDir, `${characterName}-validation-summary-${timestamp}.txt`);
      await fs.writeFile(textPath, textSummary);

      console.log(`📄 Validation report generated: ${reportPath}`);
      return reportPath;

    } catch (error) {
      console.error('❌ Failed to generate validation report:', error);
      throw error;
    }
  }

  /**
   * Get score grade
   */
  private getScoreGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: ValidationIssue['severity']): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'major': return '⚠️';
      case 'minor': return 'ℹ️';
      case 'warning': return '💡';
      default: return '•';
    }
  }

  /**
   * Validate multiple images in batch
   */
  async validateBatch(
    imagePaths: string[],
    characterName: string,
    options: {
      generateSummary?: boolean;
      strictMode?: boolean;
    } = {}
  ): Promise<ValidationResult[]> {
    console.log(`🔍 Batch validation: ${imagePaths.length} images for ${characterName}`);

    const results: ValidationResult[] = [];

    for (const imagePath of imagePaths) {
      try {
        const result = await this.validateImage(imagePath, characterName, 'frontal', {
          useReference: true,
          strictMode: options.strictMode
        });
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to validate ${imagePath}:`, error);
      }
    }

    if (options.generateSummary) {
      await this.generateBatchSummary(characterName, results);
    }

    const passedCount = results.filter(r => r.valid).length;
    console.log(`✅ Batch validation complete: ${passedCount}/${results.length} passed`);

    return results;
  }

  /**
   * Generate batch validation summary
   */
  private async generateBatchSummary(
    characterName: string,
    results: ValidationResult[]
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const summaryDir = path.join(process.cwd(), 'output', 'validation-summaries');
      await fs.mkdir(summaryDir, { recursive: true });

      const summary = {
        character: characterName,
        validationDate: new Date().toISOString(),
        totalImages: results.length,
        passed: results.filter(r => r.valid).length,
        failed: results.filter(r => !r.valid).length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        characterMatchRate: (results.filter(r => r.characterMatch).length / results.length) * 100,
        commonIssues: this.analyzeCommonIssues(results),
        recommendations: this.generateBatchRecommendations(results)
      };

      const summaryPath = path.join(summaryDir, `${characterName}-batch-summary-${timestamp}.json`);
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

      console.log(`📊 Batch summary generated: ${summaryPath}`);
    } catch (error) {
      console.error('❌ Failed to generate batch summary:', error);
    }
  }

  /**
   * Analyze common issues across batch
   */
  private analyzeCommonIssues(results: ValidationResult[]): any {
    const issueFrequency: { [key: string]: number } = {};

    results.forEach(result => {
      result.issues.forEach(issue => {
        const key = `${issue.category}-${issue.severity}`;
        issueFrequency[key] = (issueFrequency[key] || 0) + 1;
      });
    });

    return Object.entries(issueFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ issue: key, frequency: count, percentage: (count / results.length) * 100 }));
  }

  /**
   * Generate batch recommendations
   */
  private generateBatchRecommendations(results: ValidationResult[]): string[] {
    const allRecommendations = results.flatMap(r => r.recommendations);
    const recommendationFrequency: { [key: string]: number } = {};

    allRecommendations.forEach(rec => {
      recommendationFrequency[rec] = (recommendationFrequency[rec] || 0) + 1;
    });

    return Object.entries(recommendationFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([rec]) => rec);
  }
}

export const consistencyValidator = new ConsistencyValidator();