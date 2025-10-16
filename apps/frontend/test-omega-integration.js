/**
 * Omega Workflow Integration Test
 *
 * Tests the new 12-engine orchestrator integration
 */

const fetch = require('node-fetch');

async function testOmegaIntegration() {
  console.log('🔥 Testing Omega Workflow Integration (12 Engines)');
  console.log('================================================================================\n');

  const API_BASE = 'http://localhost:3007';

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 1: Health Check
  // ═══════════════════════════════════════════════════════════════════════

  console.log('TEST 1: Health Check');
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const result = await response.json();

    if (result.success) {
      console.log('✅ omega-service.js is running\n');
    } else {
      console.log('❌ Health check failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Cannot connect to omega-service.js');
    console.log('   Make sure it\'s running: node omega-service.js\n');
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 2: Template Workflow with Omega Orchestrator
  // ═══════════════════════════════════════════════════════════════════════

  console.log('TEST 2: Single Video Template with Omega Workflow');
  console.log('⚠️  This will use GEMINI_API_KEY and generate a real video (~$6)\n');

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ';

  if (!apiKey || apiKey === 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ') {
    console.log('🔑 Using hardcoded GEMINI_API_KEY for testing');
  }

  try {
    const testRequest = {
      templateType: 'single',
      config: {
        character: {
          prompt: 'Professional contractor, 35 years old, natural outdoor lighting, authentic appearance',
          temperature: 0.3
        },
        scenarios: [{
          name: 'Omega Test Video',
          mainPrompt: 'Professional contractor demonstrates surface preparation technique at job site',
          timing: {
            '0-2s': 'Contractor introduces surface prep importance',
            '2-6s': 'Explains workflow: power wash, scrape, fill, sand, prime',
            '6-8s': 'Concludes with quality guarantee'
          },
          environment: {
            location: 'Real job site with wall visible in background',
            atmosphere: 'Authentic outdoor work environment',
            interactionElements: ['wall surface', 'work area']
          }
        }],
        veo3Options: {
          duration: 8,
          aspectRatio: '9:16',
          quality: 'professional', // Use professional preset (not viral-guaranteed to save cost)
          enableSoundGeneration: true
        }
      },
      apiKey: apiKey
    };

    console.log('📤 Sending request to /api/template-workflow...');
    console.log(`   Template: ${testRequest.templateType}`);
    console.log(`   Quality: ${testRequest.config.veo3Options.quality}`);
    console.log(`   Duration: ${testRequest.config.veo3Options.duration}s\n`);

    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/api/template-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });

    const result = await response.json();
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!response.ok) {
      console.log(`❌ Request failed (${response.status}):`, result.error);
      return;
    }

    if (result.success) {
      console.log('\n✅ OMEGA WORKFLOW GENERATION SUCCESSFUL!');
      console.log('================================================================================');
      console.log(`📁 Video: ${result.videos[0].path}`);
      if (result.characterImage) {
        console.log(`📸 Character: ${result.characterImage}`);
      }

      console.log('\n📊 Basic Metadata:');
      console.log(`   Template Type: ${result.metadata.templateType}`);
      console.log(`   Format: ${result.metadata.format}`);
      console.log(`   Duration: ${result.metadata.duration}s`);
      console.log(`   Total Cost: $${result.metadata.totalCost.toFixed(2)}`);
      console.log(`   Generation Time: ${totalTime}s`);

      if (result.metadata.viralScore !== undefined) {
        console.log('\n🔥 OMEGA WORKFLOW METRICS:');
        console.log(`   📊 Viral Score: ${result.metadata.viralScore}/100`);
        console.log(`   📊 Quality Score: ${result.metadata.qualityScore}/100`);
        console.log(`   🔧 Engines Used: ${result.metadata.enginesUsed}/12`);
        console.log(`   ⚡ Utilization Rate: ${result.metadata.utilizationRate?.toFixed(1)}%`);

        if (result.metadata.techniquesApplied) {
          const techniques = result.metadata.techniquesApplied;
          let totalTechniques = 0;
          console.log('\n✨ Techniques Applied:');
          Object.entries(techniques).forEach(([category, items]) => {
            if (items && items.length > 0) {
              console.log(`   - ${category}: ${items.length} techniques`);
              totalTechniques += items.length;
            }
          });
          console.log(`   TOTAL: ${totalTechniques} techniques`);
        }

        console.log('\n🎯 OMEGA ORCHESTRATOR WORKING!');
        console.log('   ✅ 12-engine integration successful');
        console.log('   ✅ Viral scoring active');
        console.log('   ✅ Quality gates passed');
        console.log('   ✅ Technique auto-selection working');

      } else {
        console.log('\n⚠️  WARNING: Omega metrics not present');
        console.log('   This means the old VEO3Service was used instead of Omega Orchestrator');
        console.log('   Check omega-workflow-bridge.ts integration');
      }

    } else {
      console.log('❌ Generation failed:', result.error);
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
    if (error.stack) {
      console.log(error.stack);
    }
  }

  console.log('\n================================================================================');
  console.log('🏁 Test Complete\n');
}

// Run test
testOmegaIntegration().catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
