/**
 * Quick test for Task 5: Quality Validation System
 * Verify the 4-phase validation approach works correctly
 */

import dotenv from 'dotenv';
dotenv.config();

import { OmegaQualityValidator } from './src/omega-workflow/quality-validator';
import { OmegaVideoRequest } from './src/omega-workflow/omega-workflow';

async function testQualityValidator() {
  console.log('🧪 Testing Quality Validation System...\n');

  const validator = new OmegaQualityValidator();

  // Test request
  const testRequest: OmegaVideoRequest = {
    character: 'Aria',
    prompt: 'Professional insurance expert explaining QuoteMoto savings',
    qualityLevel: 'professional',
    platform: 'tiktok',
    enableAllEngines: true,
    targetViralScore: 85,
    maxCost: 3500,
    maxTime: 25,
    aspectRatio: '9:16',
    duration: 30,
    skinRealismConfig: {
      age: 26,
      gender: 'female',
      ethnicity: 'mixed heritage',
      skinTone: 'medium',
      imperfectionTypes: ['freckles', 'pores', 'asymmetry'],
      overallIntensity: 'moderate'
    },
    photoRealismPreset: 'business-headshot',
    zhoTechniquesEnabled: true,
    transformationEnabled: true,
    validationEnabled: true
  };

  try {
    console.log('🔍 Running comprehensive validation...');
    const result = await validator.validateComprehensive(testRequest);

    console.log('\n📊 VALIDATION RESULTS:');
    console.log(`✅ Overall Status: ${result.overall.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`📈 Final Score: ${result.overall.score}/100`);
    console.log(`⏱️  Total Time: ${result.overall.totalTime.toFixed(1)} minutes`);

    console.log('\n📋 Phase Results:');
    result.phases.forEach((phase, index) => {
      const icon = phase.passed ? '✅' : '❌';
      console.log(`${icon} Phase ${index + 1} (${phase.phase}): ${phase.score}/100`);
      if (phase.issues.length > 0) {
        phase.issues.forEach(issue => {
          const severity = issue.severity === 'critical' ? '🚨' :
                          issue.severity === 'major' ? '⚠️' : 'ℹ️';
          console.log(`   ${severity} ${issue.message}`);
        });
      }
    });

    console.log('\n🎯 VALIDATION METRICS:');
    const finalPhase = result.phases[result.phases.length - 1];
    console.log(`Viral Score: ${finalPhase.metrics.viralScore}/100`);
    console.log(`Character Consistency: ${finalPhase.metrics.characterConsistency}%`);
    console.log(`Engine Utilization: ${finalPhase.metrics.engineUtilization}%`);
    console.log(`Cost Efficiency: ${finalPhase.metrics.costEfficiency.toFixed(2)} viral score per dollar`);

    if (result.overall.passed) {
      console.log('\n🎉 Quality Validation System: OPERATIONAL');
      console.log('✅ Task 5 validation: COMPLETE');
    } else {
      console.log('\n⚠️  Some validation phases failed - check configuration');
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error);
    process.exit(1);
  }
}

// Run the test
testQualityValidator().catch(console.error);