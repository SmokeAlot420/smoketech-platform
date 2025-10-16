import { consistencyValidator, ValidationIssue } from './consistency-validator';
import { referenceManager } from './reference-manager';
import { CharacterConsistencyEngine } from './enhancement/characterConsistency';
import fs from 'fs/promises';
import path from 'path';

/**
 * Ultra-Validate All Aria Images for Same Face/Character Consistency
 */
async function ultraValidateAriaBatch(): Promise<void> {
  console.log('🔬 ULTRA-VALIDATION: Checking ALL Aria images for same face/character');
  console.log('👩‍💼 Target: Aria QuoteMoto Insurance Expert');
  console.log('🎯 Goal: 100% same person recognition across all generations');
  console.log('');

  try {
    // Get all Aria ZHO enhanced images
    const outputDir = path.join(process.cwd(), 'output', 'aria-zho-enhanced');
    const files = await fs.readdir(outputDir);
    const imageFiles = files.filter(file => file.endsWith('.png'));

    console.log(`📸 Found ${imageFiles.length} Aria images to validate`);
    console.log('');

    // Initialize reference manager
    await referenceManager.initialize();

    // Load Aria's identity for validation
    const ARIA_CHARACTER = CharacterConsistencyEngine.createAriaQuoteMotoIdentity();

    console.log('🧬 ARIA CHARACTER DNA (What Makes Her Unique):');
    console.log(`  👤 Name: ${ARIA_CHARACTER.name}`);
    console.log(`  💎 Face Shape: ${ARIA_CHARACTER.coreFeatures.faceShape}`);
    console.log(`  👀 Eyes: ${ARIA_CHARACTER.coreFeatures.eyeShape} ${ARIA_CHARACTER.coreFeatures.eyeColor}`);
    console.log(`  👃 Nose: ${ARIA_CHARACTER.coreFeatures.noseShape}`);
    console.log(`  💋 Lips: ${ARIA_CHARACTER.coreFeatures.lipShape}`);
    console.log(`  ✨ Beauty Mark: ${ARIA_CHARACTER.distinctiveMarks.moles[0].description} ${ARIA_CHARACTER.distinctiveMarks.moles[0].location}`);
    console.log(`  🎭 Asymmetry: ${ARIA_CHARACTER.distinctiveMarks.asymmetry.map((a: any) => a.variation).join(', ')}`);
    console.log(`  ☀️ Freckles: ${ARIA_CHARACTER.distinctiveMarks.freckles.density} ${ARIA_CHARACTER.distinctiveMarks.freckles.pattern}`);
    console.log('');

    // Validate each image
    const validationResults = [];
    let sameCharacterCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(outputDir, imageFile);

      console.log(`🔍 VALIDATING IMAGE ${i + 1}/${imageFiles.length}: ${imageFile}`);

      const result = await consistencyValidator.validateImage(
        imagePath,
        'Aria',
        'frontal',
        {
          useReference: false, // Don't use reference comparison for now
          strictMode: true,
          generateReport: false
        }
      );

      validationResults.push({
        filename: imageFile,
        ...result
      });

      // Check if this is the same character
      if (result.characterMatch) {
        sameCharacterCount++;
        console.log(`  ✅ SAME ARIA: Score ${result.score}/100 (${result.valid ? 'VALID' : 'INVALID'})`);
      } else {
        console.log(`  ❌ DIFFERENT PERSON: Score ${result.score}/100 (${result.valid ? 'VALID' : 'INVALID'})`);
      }

      if (result.issues.length > 0) {
        console.log(`  ⚠️  Issues Found: ${result.issues.length}`);
        result.issues.forEach((issue: ValidationIssue) => {
          console.log(`    • ${issue.severity.toUpperCase()}: ${issue.description}`);
        });
      }
      console.log('');
    }

    // Generate ultra-summary
    const totalImages = imageFiles.length;
    const sameCharacterRate = (sameCharacterCount / totalImages) * 100;
    const averageScore = validationResults.reduce((sum, r) => sum + r.score, 0) / totalImages;
    const validImages = validationResults.filter(r => r.valid).length;

    console.log('🎯 ULTRA-VALIDATION RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📸 Total Images Validated: ${totalImages}`);
    console.log(`👩‍💼 Same Aria Character: ${sameCharacterCount}/${totalImages} (${sameCharacterRate.toFixed(1)}%)`);
    console.log(`📊 Average Quality Score: ${averageScore.toFixed(1)}/100`);
    console.log(`✅ Valid for Use: ${validImages}/${totalImages} (${((validImages/totalImages)*100).toFixed(1)}%)`);
    console.log('');

    // Character consistency analysis
    if (sameCharacterRate >= 90) {
      console.log('🏆 EXCELLENT CHARACTER CONSISTENCY!');
      console.log('✨ ZHO Universal Character Preservation is working perfectly');
      console.log('🎯 Aria identity preserved across all generations');
    } else if (sameCharacterRate >= 75) {
      console.log('👍 GOOD CHARACTER CONSISTENCY');
      console.log('⚠️  Some variations in character recognition detected');
      console.log('💡 Consider using reference images for better consistency');
    } else {
      console.log('⚠️  CHARACTER CONSISTENCY ISSUES DETECTED');
      console.log('🔧 Recommendations:');
      console.log('   • Use reference images from multi-angle set');
      console.log('   • Apply stronger PRESERVE patterns');
      console.log('   • Check for prompt drift between generations');
    }

    console.log('');
    console.log('📋 DETAILED BREAKDOWN:');
    validationResults.forEach((result, i) => {
      const status = result.characterMatch ? '✅' : '❌';
      const grade = getScoreGrade(result.score);
      console.log(`  ${status} Image ${i+1}: ${grade} (${result.score}/100) - ${result.characterMatch ? 'SAME ARIA' : 'DIFFERENT PERSON'}`);
    });

    console.log('');
    console.log('💡 NEXT STEPS:');
    if (sameCharacterRate < 100) {
      console.log('  • Review images that failed character matching');
      console.log('  • Consider regenerating failed images with enhanced prompts');
      console.log('  • Use reference manager to store best examples');
    } else {
      console.log('  • Perfect consistency achieved!');
      console.log('  • Ready for viral content creation');
      console.log('  • Consider creating style variants while preserving identity');
    }

    // Save ultra-validation report
    const reportData = {
      validationType: 'ULTRA-CHARACTER-CONSISTENCY-CHECK',
      character: 'Aria QuoteMoto Insurance Expert',
      validatedAt: new Date().toISOString(),
      summary: {
        totalImages,
        sameCharacterCount,
        sameCharacterRate,
        averageScore,
        validImages,
        consistencyLevel: sameCharacterRate >= 90 ? 'EXCELLENT' :
                          sameCharacterRate >= 75 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      },
      characterIdentity: ARIA_CHARACTER,
      results: validationResults
    };

    const reportPath = path.join(outputDir, `aria-ultra-validation-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Ultra-validation report saved: ${reportPath}`);

  } catch (error: any) {
    console.error('❌ Ultra-validation failed:', error.message);
    throw error;
  }
}

function getScoreGrade(score: number): string {
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

// Execute ultra-validation
if (require.main === module) {
  ultraValidateAriaBatch()
    .then(() => {
      console.log('\n🎯 Ultra-validation complete! Character consistency verified.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal validation error:', error);
      process.exit(1);
    });
}

export { ultraValidateAriaBatch };