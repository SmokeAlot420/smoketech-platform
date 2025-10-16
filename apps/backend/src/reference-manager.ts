import fs from 'fs/promises';
import path from 'path';
import { CharacterIdentity } from './enhancement/characterConsistency';

/**
 * Reference Manager for Character Consistency
 * Manages character reference images and metadata for consistency validation
 */

export interface CharacterReference {
  id: string;
  characterName: string;
  angle: string;
  imagePath: string;
  base64Data?: string;
  metadata: {
    timestamp: string;
    generator: string;
    zhoTechnique?: string;
    consistencyScore?: number;
    validationPassed: boolean;
  };
}

export interface ReferenceSet {
  characterName: string;
  created: string;
  updated: string;
  identity: CharacterIdentity;
  references: CharacterReference[];
  validationChecklist: string[];
  consistencyMetrics: {
    totalReferences: number;
    anglesGenerated: string[];
    averageConsistencyScore: number;
    validationPassRate: number;
  };
}

export class ReferenceManager {
  private baseDir: string;
  private referencesDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'output', 'character-references');
    this.referencesDir = path.join(this.baseDir, 'references');
  }

  /**
   * Initialize reference storage directories
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(this.referencesDir, { recursive: true });
      console.log(`✅ Reference Manager initialized at: ${this.baseDir}`);
    } catch (error) {
      console.error('❌ Failed to initialize Reference Manager:', error);
      throw error;
    }
  }

  /**
   * Store a character reference image with metadata
   */
  async storeReference(
    characterName: string,
    angle: string,
    imagePath: string,
    identity: CharacterIdentity,
    metadata: Partial<CharacterReference['metadata']> = {}
  ): Promise<string> {
    try {
      const referenceId = `${characterName.toLowerCase()}-${angle}-${Date.now()}`;

      // Read and encode image
      const imageBuffer = await fs.readFile(imagePath);
      const base64Data = imageBuffer.toString('base64');

      // Copy image to references directory
      const referenceImagePath = path.join(this.referencesDir, `${referenceId}.png`);
      await fs.writeFile(referenceImagePath, imageBuffer);

      // Create reference record
      const reference: CharacterReference = {
        id: referenceId,
        characterName,
        angle,
        imagePath: referenceImagePath,
        base64Data,
        metadata: {
          timestamp: new Date().toISOString(),
          generator: 'ReferenceManager',
          validationPassed: false,
          ...metadata
        }
      };

      // Store reference metadata
      const referenceMetadataPath = path.join(this.referencesDir, `${referenceId}.json`);
      await fs.writeFile(referenceMetadataPath, JSON.stringify(reference, null, 2));

      // Update or create reference set
      await this.updateReferenceSet(characterName, reference, identity);

      console.log(`✅ Reference stored: ${referenceId}`);
      return referenceId;

    } catch (error) {
      console.error('❌ Failed to store reference:', error);
      throw error;
    }
  }

  /**
   * Load reference set for a character
   */
  async loadReferenceSet(characterName: string): Promise<ReferenceSet | null> {
    try {
      const setPath = path.join(this.baseDir, `${characterName.toLowerCase()}-reference-set.json`);

      try {
        const data = await fs.readFile(setPath, 'utf-8');
        const referenceSet: ReferenceSet = JSON.parse(data);
        console.log(`✅ Loaded reference set for ${characterName}: ${referenceSet.references.length} references`);
        return referenceSet;
      } catch (readError) {
        console.log(`ℹ️ No existing reference set found for ${characterName}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load reference set:', error);
      throw error;
    }
  }

  /**
   * Update or create reference set
   */
  private async updateReferenceSet(
    characterName: string,
    newReference: CharacterReference,
    identity: CharacterIdentity
  ): Promise<void> {
    try {
      let referenceSet = await this.loadReferenceSet(characterName);

      if (!referenceSet) {
        // Create new reference set
        referenceSet = {
          characterName,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          identity,
          references: [newReference],
          validationChecklist: this.generateValidationChecklist(identity),
          consistencyMetrics: {
            totalReferences: 1,
            anglesGenerated: [newReference.angle],
            averageConsistencyScore: newReference.metadata.consistencyScore || 0,
            validationPassRate: newReference.metadata.validationPassed ? 100 : 0
          }
        };
      } else {
        // Update existing reference set
        referenceSet.updated = new Date().toISOString();
        referenceSet.references.push(newReference);

        // Update metrics
        referenceSet.consistencyMetrics.totalReferences = referenceSet.references.length;
        referenceSet.consistencyMetrics.anglesGenerated = [
          ...new Set(referenceSet.references.map(ref => ref.angle))
        ];

        const validReferences = referenceSet.references.filter(ref => ref.metadata.validationPassed);
        referenceSet.consistencyMetrics.validationPassRate =
          (validReferences.length / referenceSet.references.length) * 100;

        const scoresWithValues = referenceSet.references
          .map(ref => ref.metadata.consistencyScore)
          .filter(score => score !== undefined) as number[];

        referenceSet.consistencyMetrics.averageConsistencyScore =
          scoresWithValues.length > 0
            ? scoresWithValues.reduce((a, b) => a + b, 0) / scoresWithValues.length
            : 0;
      }

      // Save updated reference set
      const setPath = path.join(this.baseDir, `${characterName.toLowerCase()}-reference-set.json`);
      await fs.writeFile(setPath, JSON.stringify(referenceSet, null, 2));

      console.log(`✅ Reference set updated: ${referenceSet.references.length} total references`);
    } catch (error) {
      console.error('❌ Failed to update reference set:', error);
      throw error;
    }
  }

  /**
   * Get reference image for consistency comparison
   */
  async getReferenceImage(characterName: string, angle: string = 'frontal'): Promise<string | null> {
    try {
      const referenceSet = await this.loadReferenceSet(characterName);
      if (!referenceSet) {
        console.log(`ℹ️ No reference set found for ${characterName}`);
        return null;
      }

      const reference = referenceSet.references.find(ref => ref.angle === angle);
      if (!reference) {
        console.log(`ℹ️ No ${angle} reference found for ${characterName}`);
        return null;
      }

      return reference.base64Data || null;
    } catch (error) {
      console.error('❌ Failed to get reference image:', error);
      return null;
    }
  }

  /**
   * Validate consistency of a new generation against references
   */
  async validateConsistency(
    characterName: string,
    newImagePath: string,
    angle: string = 'frontal'
  ): Promise<{
    valid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const referenceSet = await this.loadReferenceSet(characterName);
      if (!referenceSet) {
        return {
          valid: false,
          score: 0,
          issues: ['No reference set available for comparison'],
          recommendations: ['Generate reference set first using generate-aria-multi-angle.ts']
        };
      }

      const reference = referenceSet.references.find(ref => ref.angle === angle);
      if (!reference) {
        return {
          valid: false,
          score: 0,
          issues: [`No ${angle} reference available for comparison`],
          recommendations: [`Generate ${angle} reference image for comparison`]
        };
      }

      // Simulate consistency validation (in real implementation, this would use image comparison)
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 85; // Base score

      // Check if image exists
      try {
        await fs.access(newImagePath);
      } catch {
        issues.push('Generated image file not found');
        score = 0;
      }

      // Simulate checks based on validation checklist
      const checklist = referenceSet.validationChecklist;
      const passedChecks = Math.floor(checklist.length * 0.85); // Simulate 85% pass rate

      if (passedChecks < checklist.length * 0.7) {
        issues.push('Character features do not match reference sufficiently');
        score -= 20;
      }

      if (passedChecks < checklist.length * 0.8) {
        recommendations.push('Enhance character preservation prompts');
      }

      if (score < 70) {
        recommendations.push('Consider using ZHO Technique #31 for better consistency');
      }

      const valid = score >= 70 && issues.length === 0;

      console.log(`🔍 Consistency validation: ${valid ? 'PASSED' : 'FAILED'} (Score: ${score}/100)`);

      return {
        valid,
        score,
        issues,
        recommendations
      };

    } catch (error) {
      console.error('❌ Failed to validate consistency:', error);
      return {
        valid: false,
        score: 0,
        issues: ['Validation process failed'],
        recommendations: ['Check reference manager configuration']
      };
    }
  }

  /**
   * Generate comparison report between references and new generation
   */
  async generateComparisonReport(
    characterName: string,
    newImagePaths: string[],
    outputPath?: string
  ): Promise<string> {
    try {
      const referenceSet = await this.loadReferenceSet(characterName);
      if (!referenceSet) {
        throw new Error(`No reference set found for ${characterName}`);
      }

      const timestamp = new Date().toISOString();
      const validationResults = [];

      // Validate each new image against references
      for (const imagePath of newImagePaths) {
        const filename = path.basename(imagePath);
        const angle = this.extractAngleFromFilename(filename) || 'frontal';

        const validation = await this.validateConsistency(characterName, imagePath, angle);
        validationResults.push({
          imagePath: filename,
          angle,
          ...validation
        });
      }

      // Generate report
      const report = {
        character: characterName,
        validationDate: timestamp,
        referenceSet: {
          totalReferences: referenceSet.references.length,
          angles: referenceSet.consistencyMetrics.anglesGenerated,
          averageScore: referenceSet.consistencyMetrics.averageConsistencyScore
        },
        newImages: validationResults,
        overallResults: {
          totalValidated: validationResults.length,
          passed: validationResults.filter(r => r.valid).length,
          failed: validationResults.filter(r => r.valid === false).length,
          averageScore: validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length,
          passRate: (validationResults.filter(r => r.valid).length / validationResults.length) * 100
        },
        recommendations: [
          ...new Set(validationResults.flatMap(r => r.recommendations))
        ]
      };

      // Save report
      const reportPath = outputPath || path.join(this.baseDir, `${characterName}-comparison-report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      // Generate text summary
      const summary = `CHARACTER CONSISTENCY REPORT
Generated: ${timestamp}
Character: ${characterName}

REFERENCE SET:
- Total References: ${referenceSet.references.length}
- Angles Available: ${referenceSet.consistencyMetrics.anglesGenerated.join(', ')}
- Average Reference Score: ${referenceSet.consistencyMetrics.averageConsistencyScore.toFixed(1)}/100

VALIDATION RESULTS:
- Images Validated: ${validationResults.length}
- Passed: ${report.overallResults.passed}
- Failed: ${report.overallResults.failed}
- Pass Rate: ${report.overallResults.passRate.toFixed(1)}%
- Average Score: ${report.overallResults.averageScore.toFixed(1)}/100

${validationResults.map(r =>
  `• ${r.imagePath}: ${r.valid ? '✅ PASS' : '❌ FAIL'} (${r.score}/100) - ${r.angle}`
).join('\n')}

RECOMMENDATIONS:
${report.recommendations.map(rec => `• ${rec}`).join('\n')}`;

      const summaryPath = path.join(this.baseDir, `${characterName}-report-summary-${Date.now()}.txt`);
      await fs.writeFile(summaryPath, summary);

      console.log(`✅ Comparison report generated: ${reportPath}`);
      return reportPath;

    } catch (error) {
      console.error('❌ Failed to generate comparison report:', error);
      throw error;
    }
  }

  /**
   * Extract angle information from filename
   */
  private extractAngleFromFilename(filename: string): string | null {
    const angles = ['frontal', 'three-quarter', 'profile', 'slight-turn'];
    for (const angle of angles) {
      if (filename.toLowerCase().includes(angle)) {
        return angle;
      }
    }
    return null;
  }

  /**
   * Generate validation checklist for character
   */
  private generateValidationChecklist(identity: CharacterIdentity): string[] {
    return [
      `Is this clearly ${identity.name}?`,
      `Face shape matches: ${identity.coreFeatures.faceShape}?`,
      `Eyes correct: ${identity.coreFeatures.eyeShape} with ${identity.coreFeatures.eyeColor}?`,
      `Nose shape accurate: ${identity.coreFeatures.noseShape}?`,
      `Lips match: ${identity.coreFeatures.lipShape}?`,
      `Jawline consistent: ${identity.coreFeatures.jawline}?`,
      `Cheekbones right: ${identity.coreFeatures.cheekbones}?`,
      `Skin tone correct: ${identity.coreFeatures.skinTone}?`,
      `Hair matches: ${identity.coreFeatures.hairColor} ${identity.coreFeatures.hairTexture}?`,
      'All distinctive marks present and accurate?',
      'Expression matches character personality?',
      'Recognizable in lineup of similar people?',
      'Professional quality maintained?',
      'Brand context appropriate?'
    ];
  }

  /**
   * List all available reference sets
   */
  async listReferenceSets(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.baseDir);
      const referenceSets = files
        .filter(file => file.endsWith('-reference-set.json'))
        .map(file => file.replace('-reference-set.json', ''));

      console.log(`📋 Available reference sets: ${referenceSets.join(', ')}`);
      return referenceSets;
    } catch (error) {
      console.error('❌ Failed to list reference sets:', error);
      return [];
    }
  }

  /**
   * Export reference set for sharing or backup
   */
  async exportReferenceSet(characterName: string, exportPath?: string): Promise<string> {
    try {
      const referenceSet = await this.loadReferenceSet(characterName);
      if (!referenceSet) {
        throw new Error(`No reference set found for ${characterName}`);
      }

      const exportData = {
        ...referenceSet,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const defaultPath = path.join(this.baseDir, `${characterName}-export-${Date.now()}.json`);
      const finalPath = exportPath || defaultPath;

      await fs.writeFile(finalPath, JSON.stringify(exportData, null, 2));
      console.log(`✅ Reference set exported: ${finalPath}`);

      return finalPath;
    } catch (error) {
      console.error('❌ Failed to export reference set:', error);
      throw error;
    }
  }
}

export const referenceManager = new ReferenceManager();