// TypeScript interfaces for Omega Workflow integration

export interface OmegaRequest {
  character: 'Aria' | 'Bianca' | 'Sofia' | 'Custom';
  prompt: string;
  preset: 'VIRAL_GUARANTEED' | 'PROFESSIONAL_GRADE' | 'SPEED_OPTIMIZED' | 'COST_EFFICIENT';
  platform: 'tiktok' | 'youtube' | 'instagram' | 'cross-platform';
  aspectRatio?: string;
  customCharacter?: {
    age: number;
    gender: string;
    ethnicity: string;
    profession: string;
    description: string;
  };
}

export interface OmegaMetrics {
  viralScore: number;
  totalCost: number;
  generationTime: number;
  engineUtilization?: number;
}

export interface OmegaResponse {
  success: boolean;
  jobId?: string;
  estimatedTime?: number;
  estimatedCost?: number;
  videoPath?: string;
  metrics?: OmegaMetrics;
  error?: string;
}

export interface ProgressUpdate {
  jobId: string;
  phase: 'character-generation' | 'video-creation' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  currentStep: string;
  timestamp: number;
}

export interface OmegaJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  request: OmegaRequest;
  startTime: number;
  endTime?: number;
  result?: OmegaResponse;
  progress: ProgressUpdate[];
  process?: any; // Child process reference
}

// Character configuration interfaces
export interface CharacterConfig {
  name: string;
  age: number;
  gender: string;
  ethnicity: string;
  profession: string;
  description: string;
  visualPrompts: {
    basePrompt: string;
    styleModifiers: string[];
    qualitySettings: string[];
  };
}

// Preset configuration interfaces
export interface PresetConfig {
  name: string;
  description: string;
  estimatedCost: number;
  estimatedTime: number; // in minutes
  viralScoreTarget: number;
  settings: {
    qualityLevel: 'basic' | 'standard' | 'premium' | 'ultra';
    processingIntensity: 'low' | 'medium' | 'high' | 'maximum';
    enhancementLevel: 'none' | 'basic' | 'advanced' | 'professional';
  };
}

// Error handling interfaces
export interface OmegaError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  jobId?: string;
  phase?: string;
}

// Environment configuration
export interface OmegaConfig {
  workflowPath: string;
  outputDirectory: string;
  maxConcurrentJobs: number;
  defaultTimeout: number; // in milliseconds
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  omegaServiceUrl: string; // HTTP endpoint for Omega Workflow service
}