/**
 * LANGFUSE MONITORING - Track API costs and usage
 * Essential for production cost control
 */

import { Langfuse, LangfuseTraceClient, LangfuseSpanClient } from 'langfuse';

// Model pricing (USD per request/image)
export const MODEL_PRICING = {
  // Imagen models (image generation)
  'imagegeneration@006': {
    name: 'NanoBanana Original',
    costPerImage: 0.020,
    rateLimit: '2 req/min'
  },
  'imagen-3.0-generate-001': {
    name: 'Imagen 3.0',
    costPerImage: 0.040,
    rateLimit: '2 req/min'
  },
  'imagen-3.0-fast-generate-001': {
    name: 'Imagen 3.0 Fast',
    costPerImage: 0.030,
    rateLimit: '2 req/min'
  },

  // Gemini models (text generation) - cost per 1K tokens
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash',
    inputCostPer1K: 0.00015,
    outputCostPer1K: 0.0006,
    rateLimit: '60 req/min'
  },

  // VEO3 (video generation) - estimated
  'veo3': {
    name: 'VEO3 Video',
    costPerVideo: 0.10,
    rateLimit: '10 req/hour'
  }
};

class LangfuseMonitor {
  private client: Langfuse;
  private currentTrace: LangfuseTraceClient | null = null;
  private spans: Map<string, LangfuseSpanClient> = new Map();

  constructor() {
    // Initialize Langfuse client
    this.client = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
      secretKey: process.env.LANGFUSE_SECRET_KEY || '',
      baseUrl: process.env.LANGFUSE_URL || 'https://cloud.langfuse.com',
      release: process.env.npm_package_version || '1.0.0'
    });
  }

  /**
   * Start a new workflow trace
   */
  startWorkflowTrace(workflowId: string, metadata: {
    persona: string;
    series: string;
    platforms: string[];
  }) {
    this.currentTrace = this.client.trace({
      id: workflowId,
      name: 'viral-content-pipeline',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      },
      tags: ['temporal', metadata.persona, metadata.series]
    });

    return this.currentTrace;
  }

  /**
   * Track AI generation with cost calculation
   */
  async trackGeneration(
    name: string,
    model: string,
    input: any,
    output: any,
    metadata?: any
  ) {
    if (!this.currentTrace) {
      console.warn('No active trace for generation tracking');
      return;
    }

    const generation = this.currentTrace.generation({
      name,
      model,
      input,
      output,
      metadata: {
        ...metadata,
        modelInfo: MODEL_PRICING[model as keyof typeof MODEL_PRICING]
      }
    });

    // Calculate and log costs
    const cost = this.calculateCost(model, input, output);
    if (cost > 0) {
      generation.update({
        usage: {
          totalCost: cost
        }
      });
    }

    return generation;
  }

  /**
   * Track image generation specifically
   */
  async trackImageGeneration(params: {
    model: string;
    prompt: string;
    characterRef?: string;
    success: boolean;
    imageCount?: number;
    error?: string;
  }) {
    const modelInfo = MODEL_PRICING[params.model as keyof typeof MODEL_PRICING];
    const imageCount = params.imageCount || 1;
    const totalCost = modelInfo ? (modelInfo as any).costPerImage * imageCount : 0;

    const generation = await this.trackGeneration(
      'image-generation',
      params.model,
      { prompt: params.prompt, characterRef: params.characterRef },
      { success: params.success, imageCount },
      {
        cost: totalCost,
        costBreakdown: {
          perImage: (modelInfo as any)?.costPerImage,
          total: totalCost
        },
        error: params.error
      }
    );

    // Log to console for visibility
    if (params.success) {
      console.log(`💰 Image Generation Cost: $${totalCost.toFixed(4)} for ${imageCount} image(s)`);
    }

    return generation;
  }

  /**
   * Start an activity span
   */
  startActivitySpan(activityName: string, metadata?: any) {
    if (!this.currentTrace) {
      console.warn('No active trace for span creation');
      return null;
    }

    const span = this.currentTrace.span({
      name: activityName,
      metadata
    });

    this.spans.set(activityName, span);
    return span;
  }

  /**
   * End an activity span
   */
  endActivitySpan(activityName: string, metadata?: any) {
    const span = this.spans.get(activityName);
    if (span) {
      span.end({
        metadata
      });
      this.spans.delete(activityName);
    }
  }

  /**
   * Track viral performance metrics
   */
  async trackViralPerformance(params: {
    contentId: string;
    platform: string;
    viewCount: number;
    engagementRate: number;
    shareRatio: number;
    viralScore: number;
    generationCost: number;
  }) {
    const roi = params.viralScore > 70
      ? (params.viewCount * 0.001) / params.generationCost // Rough CPM calculation
      : 0;

    if (this.currentTrace) {
      this.currentTrace.event({
        name: 'viral-performance',
        metadata: {
          ...params,
          roi,
          isViral: params.viralScore > 70,
          costPerThousandViews: params.viewCount > 0
            ? (params.generationCost / params.viewCount) * 1000
            : 0
        }
      });
    }

    // Log high-performing content
    if (params.viralScore > 70) {
      console.log(`🚀 VIRAL HIT! Platform: ${params.platform}, Score: ${params.viralScore}, ROI: ${roi.toFixed(2)}x`);
    }
  }

  /**
   * Calculate cost based on model and usage
   */
  private calculateCost(model: string, input: any, output: any): number {
    const modelInfo = MODEL_PRICING[model as keyof typeof MODEL_PRICING];

    if (!modelInfo) return 0;

    // For image models
    if (model.includes('imagen') || model.includes('imagegeneration')) {
      return (modelInfo as any).costPerImage || 0;
    }

    // For text models (Gemini)
    if (model.includes('gemini')) {
      const inputTokens = this.estimateTokens(JSON.stringify(input));
      const outputTokens = this.estimateTokens(JSON.stringify(output));

      const inputCost = (inputTokens / 1000) * ((modelInfo as any).inputCostPer1K || 0);
      const outputCost = (outputTokens / 1000) * ((modelInfo as any).outputCostPer1K || 0);

      return inputCost + outputCost;
    }

    // For video models
    if (model.includes('veo')) {
      return (modelInfo as any).costPerVideo || 0;
    }

    return 0;
  }

  /**
   * Rough token estimation (4 chars = 1 token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get daily cost summary
   */
  async getDailyCostSummary(): Promise<any> {
    // This would typically call Langfuse's analytics API
    // For now, return a placeholder
    return {
      date: new Date().toISOString().split('T')[0],
      totalCost: 0,
      breakdown: {
        imageGeneration: 0,
        textGeneration: 0,
        videoGeneration: 0
      },
      topPersonas: [],
      viralHits: 0
    };
  }

  /**
   * Flush pending events
   */
  async flush() {
    await this.client.flush();
  }

  /**
   * Shutdown the monitor
   */
  async shutdown() {
    await this.flush();
    await this.client.shutdown();
  }
}

// Export singleton instance
export const langfuseMonitor = new LangfuseMonitor();

// Export decorators for easy use
export function trackCost(_target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args: any[]) {
    const span = langfuseMonitor.startActivitySpan(propertyName, {
      args: args.slice(0, 2) // Don't log everything
    });

    try {
      const result = await originalMethod.apply(this, args);

      if (span) {
        langfuseMonitor.endActivitySpan(propertyName, {
          success: true
        });
      }

      return result;
    } catch (error) {
      if (span) {
        langfuseMonitor.endActivitySpan(propertyName, {
          success: false,
          error: (error as Error).message
        });
      }
      throw error;
    }
  };

  return descriptor;
}