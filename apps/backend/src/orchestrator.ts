import {
  proxyActivities,
  sleep,
  defineSignal,
  defineQuery,
  setHandler,
  ApplicationFailure,
  isCancellation
} from '@temporalio/workflow';
import * as activities from './activities-enhanced';

// Define activity proxies
const {
  generateAIContent,
  generateUltraEnhancedContent,
  distributeContent,
  analyzePerformance,
  replicateWinner,
  rotateProxy,
  warmUpAccount,
  checkAccountHealth
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  retry: {
    initialInterval: '30s',
    backoffCoefficient: 2,
    maximumAttempts: 5,
    maximumInterval: '5 minutes'
  }
});

// Signals for workflow control
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');
export const scaleSignal = defineSignal<[number]>('scale');

// Queries for monitoring
export const getMetricsQuery = defineQuery<WorkflowMetrics>('getMetrics');
export const getStatusQuery = defineQuery<WorkflowStatus>('getStatus');

// Types
export interface WorkflowInput {
  personas: PersonaConfig[];
  viralSeries: ViralSeriesTemplate[];
  targetPlatforms: Platform[];
  batchSize: number;
  viralThreshold: number;
  useEnhancedMode?: boolean;
  generateVariations?: boolean;
  costMode?: 'fast' | 'premium' | 'dynamic';
  platforms?: string[];
}

export interface PersonaConfig {
  id: string;
  name: string;
  avatar: string;
  voice: string;
  niche: string;
  personality: string;
  contentStyle: string;
}

export interface ViralSeriesTemplate {
  id: string;
  name: string;
  format: string;
  hooks: string[];
  structure: ContentStructure;
  variations: VariationConfig;
}

export interface ContentStructure {
  duration: number;
  scenes: SceneTemplate[];
  musicStyle: string;
  textOverlays: boolean;
}

export interface SceneTemplate {
  type: 'intro' | 'main' | 'outro';
  duration: number;
  elements: string[];
}

export interface VariationConfig {
  topics: string[];
  styles: string[];
  angles: string[];
}

export interface Platform {
  name: 'tiktok' | 'instagram' | 'youtube';
  accounts: AccountConfig[];
}

export interface AccountConfig {
  id: string;
  username: string;
  proxy?: string;
  cookies?: string;
  status: 'active' | 'warming' | 'flagged';
}

export interface WorkflowMetrics {
  totalVideosGenerated: number;
  totalViews: number;
  viralHits: number;
  averageEngagement: number;
  revenue: number;
  costs: number;
}

export interface WorkflowStatus {
  isRunning: boolean;
  isPaused: boolean;
  currentBatch: number;
  activePersonas: number;
  lastUpdate: Date;
}

export interface WorkflowResult {
  metrics: WorkflowMetrics;
  viralContent: ViralContent[];
  errors: string[];
}

export interface ViralContent {
  id: string;
  personaId: string;
  seriesId: string;
  platform: string;
  views: number;
  engagement: number;
  viralScore: number;
  url: string;
}

// Main workflow
export async function viralContentPipeline(input: WorkflowInput): Promise<WorkflowResult> {
  let isPaused = false;
  let scaleFactor = 1;
  let batchCount = 0;

  const metrics: WorkflowMetrics = {
    totalVideosGenerated: 0,
    totalViews: 0,
    viralHits: 0,
    averageEngagement: 0,
    revenue: 0,
    costs: 0
  };

  const viralContent: ViralContent[] = [];
  const errors: string[] = [];

  // Set up signal handlers
  setHandler(pauseSignal, () => {
    isPaused = true;
  });

  setHandler(resumeSignal, () => {
    isPaused = false;
  });

  setHandler(scaleSignal, (newScale: number) => {
    scaleFactor = Math.max(0.1, Math.min(10, newScale));
  });

  // Set up query handlers
  setHandler(getMetricsQuery, () => metrics);

  setHandler(getStatusQuery, () => ({
    isRunning: true,
    isPaused,
    currentBatch: batchCount,
    activePersonas: input.personas.length * scaleFactor,
    lastUpdate: new Date()
  }));

  try {
    // Warm up accounts if needed
    for (const platform of input.targetPlatforms) {
      for (const account of platform.accounts) {
        if (account.status === 'warming') {
          await warmUpAccount({
            platform: platform.name,
            accountId: account.id
          });
        }
      }
    }

    // Main content generation loop
    while (true) {
      // Check if paused
      while (isPaused) {
        await sleep('5 minutes');
      }

      batchCount++;
      const currentBatchSize = Math.floor(input.batchSize * scaleFactor);

      // Generate content for each persona in parallel
      const contentPromises = [];
      for (const persona of input.personas) {
        for (const series of input.viralSeries) {
          for (let i = 0; i < currentBatchSize; i++) {
            contentPromises.push(
              generateContentWithRetry(persona, series, input.targetPlatforms, input)
            );
          }
        }
      }

      // Process in chunks to avoid overwhelming the system
      const chunkSize = 10;
      for (let i = 0; i < contentPromises.length; i += chunkSize) {
        const chunk = contentPromises.slice(i, i + chunkSize);
        const results = await Promise.allSettled(chunk);

        for (const result of results) {
          if (result.status === 'fulfilled') {
            const content = result.value;
            metrics.totalVideosGenerated++;

            // Distribute to platforms
            const distributions = await distributeContent({
              content,
              platforms: input.targetPlatforms.map(p => p.name)
            });

            // Wait for initial metrics (1 hour)
            await sleep('1 hour');

            // Analyze performance
            const performance = await analyzePerformance({
              contentId: content.id,
              platformData: distributions
            });

            metrics.totalViews += performance.views;
            metrics.averageEngagement =
              (metrics.averageEngagement * (metrics.totalVideosGenerated - 1) + performance.engagement)
              / metrics.totalVideosGenerated;

            // Check if viral
            if (performance.viralScore > input.viralThreshold) {
              metrics.viralHits++;
              viralContent.push({
                id: content.id,
                personaId: content.personaId || 'unknown',
                seriesId: content.seriesId || 'unknown',
                platform: performance.bestPlatform,
                views: performance.views,
                engagement: performance.engagement,
                viralScore: performance.viralScore,
                url: performance.url
              });

              // Replicate winner
              await replicateWinner({
                originalContent: content,
                variations: Math.ceil(performance.viralScore / 20)
              });
            }
          } else {
            errors.push(`Content generation failed: ${result.reason}`);
          }
        }
      }

      // Update cost metrics
      metrics.costs = metrics.totalVideosGenerated * 0.05; // Estimated AI cost per video
      metrics.revenue = metrics.totalViews * 0.0001; // Estimated revenue per view

      // Check account health
      for (const platform of input.targetPlatforms) {
        for (const account of platform.accounts) {
          const health = await checkAccountHealth({
            platform: platform.name,
            accountId: account.id
          });

          if (health.needsRotation) {
            await rotateProxy({
              platform: platform.name,
              accountId: account.id
            });
          }
        }
      }

      // Sleep between batches
      await sleep('3 hours');
    }
  } catch (error) {
    if (!isCancellation(error)) {
      throw ApplicationFailure.nonRetryable(`Workflow failed: ${error}`, 'WorkflowError');
    }
  }

  return {
    metrics,
    viralContent,
    errors
  };
}

// Helper function for content generation with retry
async function generateContentWithRetry(
  persona: PersonaConfig,
  series: ViralSeriesTemplate,
  _platforms: Platform[],
  input?: any
): Promise<any> {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use enhanced mode if specified
      const content = input?.useEnhancedMode
        ? await generateUltraEnhancedContent({
            persona,
            series,
            platforms: input.platforms || ['tiktok'],
            useEnhancedMode: true,
            generateVariations: input.generateVariations,
            costMode: input.costMode
          })
        : await generateAIContent({
            persona,
            series,
            attempt
          });
      // Ensure personaId and seriesId are in the content
      return {
        ...content,
        personaId: persona.id,
        seriesId: series.id
      };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await sleep(`${Math.pow(2, attempt)} minutes`);
      }
    }
  }

  throw lastError;
}