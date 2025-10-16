import {
  OmegaRequest,
  OmegaResponse,
  OmegaJob,
  ProgressUpdate,
  OmegaConfig,
  OmegaError
} from './omega-types';

export class OmegaBridge {
  private activeJobs = new Map<string, OmegaJob>();
  private config: OmegaConfig;
  private jobCounter = 0;

  constructor(config?: Partial<OmegaConfig>) {
    this.config = {
      workflowPath: 'E:\\v2 repo\\viral',
      outputDirectory: 'E:\\v2 repo\\viral\\generated',
      maxConcurrentJobs: 3,
      defaultTimeout: 35 * 60 * 1000, // 35 minutes
      enableLogging: true,
      logLevel: 'info',
      omegaServiceUrl: 'http://localhost:3007',
      ...config
    };
  }

  // Generate unique job ID
  private generateJobId(): string {
    this.jobCounter++;
    return `omega-${Date.now()}-${this.jobCounter.toString().padStart(3, '0')}`;
  }

  // Log messages with timestamp
  private log(level: string, message: string, jobId?: string): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const prefix = jobId ? `[${jobId}]` : '[OmegaBridge]';
    console.log(`${timestamp} ${level.toUpperCase()} ${prefix} ${message}`);
  }

  // Validate request parameters
  private validateRequest(request: OmegaRequest): OmegaError | null {
    if (!request.prompt || request.prompt.trim().length === 0) {
      return {
        code: 'INVALID_PROMPT',
        message: 'Prompt is required and cannot be empty',
        timestamp: Date.now()
      };
    }

    const validCharacters = ['Aria', 'Bianca', 'Sofia', 'Custom'];
    if (!validCharacters.includes(request.character)) {
      return {
        code: 'INVALID_CHARACTER',
        message: `Character must be one of: ${validCharacters.join(', ')}`,
        timestamp: Date.now()
      };
    }

    const validPresets = ['VIRAL_GUARANTEED', 'PROFESSIONAL_GRADE', 'SPEED_OPTIMIZED', 'COST_EFFICIENT'];
    if (!validPresets.includes(request.preset)) {
      return {
        code: 'INVALID_PRESET',
        message: `Preset must be one of: ${validPresets.join(', ')}`,
        timestamp: Date.now()
      };
    }

    if (request.character === 'Custom' && !request.customCharacter) {
      return {
        code: 'MISSING_CUSTOM_CHARACTER',
        message: 'Custom character details are required when character is set to Custom',
        timestamp: Date.now()
      };
    }

    return null;
  }

  // Start video generation
  async generateVideo(request: OmegaRequest, apiKey: string): Promise<OmegaResponse> {
    // Validate request
    const validationError = this.validateRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError.message
      };
    }

    // Check concurrent job limit
    const runningJobs = Array.from(this.activeJobs.values())
      .filter(job => job.status === 'running').length;

    if (runningJobs >= this.config.maxConcurrentJobs) {
      return {
        success: false,
        error: `Maximum concurrent jobs limit reached (${this.config.maxConcurrentJobs}). Please wait for current jobs to complete.`
      };
    }

    // Create job
    const jobId = this.generateJobId();
    const job: OmegaJob = {
      id: jobId,
      status: 'pending',
      request,
      startTime: Date.now(),
      progress: []
    };

    this.activeJobs.set(jobId, job);
    this.log('info', `Starting video generation`, jobId);

    // Start generation process
    try {
      const result = await this.executeOmegaWorkflow(job, apiKey);

      // Update job status
      job.endTime = Date.now();
      job.result = result;
      job.status = result.success ? 'completed' : 'failed';

      return {
        ...result,
        jobId
      };
    } catch (error) {
      // Handle unexpected errors
      job.endTime = Date.now();
      job.status = 'failed';
      job.result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      this.log('error', `Generation failed: ${job.result.error}`, jobId);
      return job.result;
    }
  }

  // Execute Omega Workflow via HTTP API
  private async executeOmegaWorkflow(job: OmegaJob, apiKey: string): Promise<OmegaResponse> {
    const { request } = job;

    try {
      this.log('info', 'Starting Omega Workflow via HTTP API', job.id);
      job.status = 'running';

      // Update progress: starting
      await this.updateProgress(job, 'character-generation', 10, '🎬 Connecting to Omega service...');

      // Prepare request payload for Omega service
      const omegaPayload = {
        characterName: this.mapCharacterToName(request.character),
        userRequest: request.prompt,
        style: 'professional',
        platform: request.platform,
        simpleMode: true
      };

      // Make HTTP request to Omega service
      const response = await fetch(`${this.config.omegaServiceUrl}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(omegaPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Omega service error: ${response.status} - ${errorText}`);
      }

      const omegaResult = await response.json();

      if (!omegaResult.success) {
        throw new Error(omegaResult.error || 'Omega service returned failure');
      }

      // Update progress: video started
      await this.updateProgress(job, 'video-creation', 30, '🎭 Video generation initiated...');

      // Poll for completion using the operationId
      const finalResult = await this.pollForCompletion(job, omegaResult.operationId);

      return finalResult;

    } catch (error) {
      this.log('error', `Omega Workflow failed: ${error}`, job.id);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Map our character types to Omega service character names
  private mapCharacterToName(character: string): string {
    const characterMap: Record<string, string> = {
      'Aria': 'Aria',
      'Bianca': 'Bianca',
      'Sofia': 'Sofia',
      'Custom': 'Aria' // Default fallback
    };
    return characterMap[character] || 'Aria';
  }

  // Poll Omega service for completion
  private async pollForCompletion(job: OmegaJob, operationId: string): Promise<OmegaResponse> {
    const maxPollingTime = this.config.defaultTimeout;
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollingTime) {
      try {
        const response = await fetch(`${this.config.omegaServiceUrl}/api/status/${operationId}`);

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const status = await response.json();

        if (!status.success) {
          throw new Error(status.error || 'Status check returned failure');
        }

        // Update progress based on status
        const progressPercent = Math.min(95, status.progress || 30);
        await this.updateProgress(job, 'processing', progressPercent,
          `🔧 Processing... ${status.elapsedTime}s elapsed`);

        // Check if completed (this is a simplified check - in production we'd have better status indicators)
        if (status.progress >= 95 || status.status === 'completed') {
          await this.updateProgress(job, 'complete', 100, '✅ Video generation complete!');

          return {
            success: true,
            videoPath: `/api/videos/stream/${operationId}.mp4`,
            metrics: {
              viralScore: 85, // Would come from Omega service
              totalCost: 0.25,
              generationTime: status.elapsedTime / 60,
              engineUtilization: 78
            }
          };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));

      } catch (error) {
        this.log('warn', `Polling error: ${error}`, job.id);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    // Timeout
    throw new Error('Video generation timed out');
  }

  // Helper method to update progress
  private async updateProgress(job: OmegaJob, phase: ProgressUpdate['phase'], progress: number, message: string): Promise<void> {
    const update: ProgressUpdate = {
      jobId: job.id,
      phase,
      progress,
      message,
      currentStep: phase.replace('-', ' '),
      timestamp: Date.now()
    };

    job.progress.push(update);
    this.log('info', `Progress: ${progress}% - ${phase}`, job.id);
  }

  // Legacy methods (no longer used in Turbopack-compatible version)
  // These methods were used for parsing subprocess output
  // In production, replace with HTTP API calls or message queue integration

  // Get job status
  getJobStatus(jobId: string): OmegaJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  // Get all active jobs
  getActiveJobs(): OmegaJob[] {
    return Array.from(this.activeJobs.values());
  }

  // Cancel a job
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job || !job.process) {
      return false;
    }

    this.log('info', 'Cancelling job', jobId);

    try {
      job.process.kill('SIGTERM');
      job.status = 'failed';
      job.endTime = Date.now();
      job.result = {
        success: false,
        error: 'Job was cancelled by user'
      };

      this.activeJobs.delete(jobId);
      return true;
    } catch (error) {
      this.log('error', `Failed to cancel job: ${error}`, jobId);
      return false;
    }
  }

  // Cleanup all jobs (call on shutdown)
  cleanup(): void {
    this.log('info', 'Cleaning up all active jobs');

    for (const job of this.activeJobs.values()) {
      if (job.process && job.status === 'running') {
        try {
          job.process.kill('SIGTERM');
        } catch (error) {
          this.log('error', `Failed to kill process: ${error}`, job.id);
        }
      }
    }

    this.activeJobs.clear();
  }

  // Get system stats
  getStats(): {
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalJobs: number;
  } {
    const jobs = Array.from(this.activeJobs.values());
    return {
      activeJobs: jobs.filter(j => j.status === 'running').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      totalJobs: this.jobCounter
    };
  }
}

// Singleton instance
let omegaBridgeInstance: OmegaBridge | null = null;

export function getOmegaBridge(config?: Partial<OmegaConfig>): OmegaBridge {
  if (!omegaBridgeInstance) {
    omegaBridgeInstance = new OmegaBridge(config);
  }
  return omegaBridgeInstance;
}

// Cleanup on process exit
process.on('SIGINT', () => {
  if (omegaBridgeInstance) {
    omegaBridgeInstance.cleanup();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (omegaBridgeInstance) {
    omegaBridgeInstance.cleanup();
  }
  process.exit(0);
});