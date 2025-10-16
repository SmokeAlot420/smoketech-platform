import { Client, Connection, WorkflowIdReusePolicy } from '@temporalio/client';
import { viralContentPipeline, ViralSeriesTemplate } from './orchestrator';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// QuoteMoto-specific personas configuration
const quoteMotoPersonas = [
  {
    id: 'aria-insurance-expert',
    name: 'Aria',
    age: 28,
    personality: 'professional insurance expert',
    profession: 'Insurance Advisor',
    company: 'QuoteMoto',
    ethnicity: 'Mixed Latina/European heritage',
    avatar: 'ultra-realistic-spokesperson',
    voice: 'professional-female',
    niche: 'insurance',
    contentStyle: 'commercial',
    appearance: {
      face: 'Heart-shaped face',
      eyes: 'Warm brown eyes',
      features: 'Natural asymmetry (left eye slightly smaller)',
      imperfections: [
        'Subtle freckles on nose bridge and upper cheeks',
        'Visible pores in T-zone areas',
        'Natural facial asymmetry',
        'Subtle expression lines around eyes',
        'Small beauty mark near left eye'
      ]
    },
    style: 'Professional insurance expert, trustworthy demeanor',
    brandColors: {
      primary: '#0074C9', // QuoteMoto Blue (correct from website)
      secondary: '#F97316', // QuoteMoto Orange (correct from website)
      accent: '#FFFFFF' // White
    },
    messaging: {
      primary: 'Save money on car insurance, QuoteMoto',
      secondary: 'DUI no problem, QuoteMoto',
      cta: 'Visit QuoteMoto.com'
    }
  }
];

// QuoteMoto-specific viral series
const quoteMotoViralSeries = [
  {
    id: 'quotemoto-savings-expert',
    name: 'QuoteMoto Savings Expert Series',
    category: 'insurance-savings',
    template: {
      format: 'professional-commercial',
      hook: 'Hi, I\'m Aria from QuoteMoto...',
      style: 'trustworthy insurance consultation',
      duration: 30,
      setting: 'modern professional office',
      message: 'insurance savings consultation'
    },
    viralPotential: 85,
    platforms: ['tiktok', 'instagram', 'youtube'],
    contentType: 'savings-commercial'
  },
  {
    id: 'quotemoto-dui-friendly',
    name: 'QuoteMoto DUI-Friendly Series',
    category: 'insurance-acceptance',
    template: {
      format: 'compassionate-commercial',
      hook: 'I\'m Aria from QuoteMoto, and I understand...',
      style: 'compassionate insurance expert',
      duration: 30,
      setting: 'professional studio with documentation',
      message: 'DUI-friendly insurance options'
    },
    viralPotential: 90,
    platforms: ['tiktok', 'instagram', 'youtube'],
    contentType: 'dui-friendly-commercial'
  },
  {
    id: 'quotemoto-quick-quote',
    name: 'QuoteMoto Quick Quote Demo Series',
    category: 'insurance-process',
    template: {
      format: 'demonstration-commercial',
      hook: 'Getting car insurance shouldn\'t take all day...',
      style: 'friendly mobile app demonstration',
      duration: 30,
      setting: 'modern vehicle interior with mobile app',
      message: 'quick quote process demonstration'
    },
    viralPotential: 88,
    platforms: ['tiktok', 'instagram', 'youtube'],
    contentType: 'quick-quote-commercial'
  }
];

// Transform QuoteMoto viral series to proper ViralSeriesTemplate format
function transformToViralSeriesTemplate(quoteMotoSeries: typeof quoteMotoViralSeries): ViralSeriesTemplate[] {
  return quoteMotoSeries.map(series => ({
    id: series.id,
    name: series.name,
    format: series.template.format,
    hooks: [series.template.hook], // Convert single hook to array
    structure: {
      duration: series.template.duration,
      scenes: [
        {
          type: 'intro' as const,
          duration: 5,
          elements: [series.template.hook, 'QuoteMoto branding']
        },
        {
          type: 'main' as const,
          duration: series.template.duration - 10,
          elements: [series.template.message, series.template.setting]
        },
        {
          type: 'outro' as const,
          duration: 5,
          elements: ['Call to action', 'QuoteMoto contact info']
        }
      ],
      musicStyle: 'commercial-friendly',
      textOverlays: true
    },
    variations: {
      topics: [series.contentType, series.category],
      styles: [series.template.style, 'professional commercial'],
      angles: ['eye-level', 'close-up', 'medium-shot']
    }
  }));
}

// QuoteMoto target platforms with specific accounts
const quoteMotoTargetPlatforms = [
  {
    name: 'tiktok' as const,
    accounts: [
      {
        id: 'quotemoto-tiktok-main',
        username: 'quotemoto_insurance',
        status: 'active' as const,
        followers: 0,
        dailyLimit: 5
      }
    ]
  },
  {
    name: 'instagram' as const,
    accounts: [
      {
        id: 'quotemoto-instagram-main',
        username: 'quotemoto_official',
        status: 'active' as const,
        followers: 0,
        dailyLimit: 8
      }
    ]
  },
  {
    name: 'youtube' as const,
    accounts: [
      {
        id: 'quotemoto-youtube-main',
        username: 'QuoteMoto Insurance',
        status: 'active' as const,
        subscribers: 0,
        dailyLimit: 3
      }
    ]
  }
];

export interface QuoteMotoWorkflowOptions {
  campaignTypes?: ('savings' | 'dui-friendly' | 'quick-quote')[];
  batchSize?: number;
  viralThreshold?: number;
  dailyLimit?: number;
  enhancedMode?: boolean;
}

export async function startQuoteMotoWorkflow(options: QuoteMotoWorkflowOptions = {}): Promise<void> {
  // Connect to Temporal
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });

  // Configure workflow input
  const workflowInput = {
    personas: quoteMotoPersonas,
    viralSeries: transformToViralSeriesTemplate(quoteMotoViralSeries.filter(series => {
      if (!options.campaignTypes || options.campaignTypes.length === 0) {
        return true; // Include all if no specific types requested
      }
      return options.campaignTypes.some(type => series.contentType.includes(type));
    })),
    targetPlatforms: quoteMotoTargetPlatforms,
    batchSize: options.batchSize || 10, // Generate 10+ pieces as requested
    viralThreshold: options.viralThreshold || 75, // QuoteMoto viral threshold
    dailyLimit: options.dailyLimit || 20,
    enhancedMode: options.enhancedMode !== false, // Default to enhanced

    // QuoteMoto-specific configuration
    brandConfiguration: {
      name: 'QuoteMoto',
      colors: {
        primary: '#0074C9',
        secondary: '#F97316',
        accent: '#FFFFFF'
      },
      messaging: {
        primary: 'Save money on car insurance, QuoteMoto',
        secondary: 'DUI no problem, QuoteMoto',
        cta: 'Visit QuoteMoto.com'
      },
      spokesperson: 'Aria',
      industry: 'Insurance'
    }
  };

  // Generate workflow ID
  const workflowId = `quotemoto-pipeline-${uuidv4()}`;

  console.log('🎯 Starting QuoteMoto Viral Content Pipeline');
  console.log(`📋 Workflow ID: ${workflowId}`);
  console.log(`👩‍💼 Spokesperson: Aria (Ultra-Realistic Insurance Expert)`);
  console.log(`🎨 Brand Colors: Blue (#0066CC) & Orange (#FF6B35)`);
  console.log(`📹 Campaign Types: ${workflowInput.viralSeries.map(s => s.variations.topics[0]).join(', ')}`);
  console.log(`📱 Target Platforms: ${workflowInput.targetPlatforms.map(p => p.name).join(', ')}`);
  console.log(`📦 Batch Size: ${workflowInput.batchSize} pieces per run`);
  console.log(`🎯 Viral Threshold: ${workflowInput.viralThreshold}`);

  try {
    // Start the workflow
    const handle = await client.workflow.start(viralContentPipeline, {
      taskQueue: 'viral-content-queue',
      args: [workflowInput],
      workflowId,
      workflowIdReusePolicy: WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY,

      // Workflow timeouts
      workflowExecutionTimeout: '7 days', // QuoteMoto campaign duration
      workflowRunTimeout: '6 hours', // Per batch timeout

      // Retry policy
      retry: {
        initialInterval: '1 minute',
        backoffCoefficient: 2,
        maximumInterval: '30 minutes',
        maximumAttempts: 5,
      },
    });

    console.log(`\n✅ QuoteMoto Workflow started successfully!`);
    console.log(`🔗 View in Temporal UI: http://localhost:8233/namespaces/default/workflows/${workflowId}`);

    // QuoteMoto-specific commands
    console.log('\n📝 QuoteMoto Workflow Commands:');
    console.log(`\n  📊 Query metrics:`);
    console.log(`  temporal workflow query --workflow-id ${workflowId} --name getMetrics`);
    console.log(`\n  📈 Query status:`);
    console.log(`  temporal workflow query --workflow-id ${workflowId} --name getStatus`);
    console.log(`\n  ⏸️ Pause workflow:`);
    console.log(`  temporal workflow signal --workflow-id ${workflowId} --name pause`);
    console.log(`\n  ▶️ Resume workflow:`);
    console.log(`  temporal workflow signal --workflow-id ${workflowId} --name resume`);
    console.log(`\n  🔄 Scale content (3x example):`);
    console.log(`  temporal workflow signal --workflow-id ${workflowId} --name scale --input 3.0`);

    // Monitor initial performance
    console.log('\n⏳ Monitoring QuoteMoto content generation (press Ctrl+C to exit)...\n');

    // Poll for metrics every 2 minutes (QuoteMoto content takes longer to generate)
    const pollInterval = setInterval(async () => {
      try {
        const metrics: any = await handle.query('getMetrics');
        const status: any = await handle.query('getStatus');

        console.log('📊 QuoteMoto Generation Metrics:');
        console.log(`  🎬 Content Generated: ${metrics.totalVideosGenerated} pieces`);
        console.log(`  📸 Aria Images: ${metrics.totalVideosGenerated} ultra-realistic photos`);
        console.log(`  👀 Total Views: ${metrics.totalViews.toLocaleString()}`);
        console.log(`  🔥 Viral Hits: ${metrics.viralHits} (threshold: ${workflowInput.viralThreshold})`);
        console.log(`  💰 Avg Engagement: ${metrics.averageEngagement.toFixed(2)}%`);
        console.log(`  💵 Revenue: $${metrics.revenue.toFixed(2)}`);
        console.log(`  📈 Costs: $${metrics.costs.toFixed(2)} (NanaBanana + VEO3)`);
        console.log(`  📊 ROI: ${((metrics.revenue / metrics.costs - 1) * 100).toFixed(1)}%`);
        console.log(`  ⚡ Status: ${status.isPaused ? '⏸️ Paused' : '▶️ Generating QuoteMoto Content'}`);
        console.log(`  🎯 Current Campaign: ${status.currentBatch}`);
        console.log('---');
      } catch (error) {
        console.error('Error querying QuoteMoto workflow:', error);
      }
    }, 120000); // Poll every 2 minutes

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping QuoteMoto monitoring (workflow continues running)...');
      clearInterval(pollInterval);
      await connection.close();
      console.log('🎯 QuoteMoto workflow is still running in Temporal!');
      console.log(`🔗 View progress: http://localhost:8233/namespaces/default/workflows/${workflowId}`);
      process.exit(0);
    });

    return;

  } catch (error) {
    console.error('❌ Failed to start QuoteMoto workflow:', error);
    await connection.close();
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  const options: QuoteMotoWorkflowOptions = {};

  // Parse command line arguments
  if (args.includes('--savings-only')) {
    options.campaignTypes = ['savings'];
  } else if (args.includes('--dui-only')) {
    options.campaignTypes = ['dui-friendly'];
  } else if (args.includes('--quick-quote-only')) {
    options.campaignTypes = ['quick-quote'];
  }

  const batchArg = args.find(arg => arg.startsWith('--batch='));
  if (batchArg) {
    options.batchSize = parseInt(batchArg.split('=')[1]);
  }

  const thresholdArg = args.find(arg => arg.startsWith('--threshold='));
  if (thresholdArg) {
    options.viralThreshold = parseInt(thresholdArg.split('=')[1]);
  }

  startQuoteMotoWorkflow(options).catch((err) => {
    console.error('❌ Failed to start QuoteMoto workflow:', err);
    process.exit(1);
  });
}