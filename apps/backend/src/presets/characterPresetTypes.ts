/**
 * Character Generation Preset System - Type Definitions
 *
 * Defines all TypeScript interfaces for the character preset system,
 * enabling type-safe preset management and character generation.
 */

/**
 * Shot type configuration for character library generation
 */
export interface ShotTypeConfig {
  id: string;
  name: string;
  description: string;
  aspectRatio: '9:16' | '16:9' | '4:5' | '1:1';
  platform: string;
  useGreenScreen: boolean;
  promptModifications: string;
  technicalRequirements: {
    composition: string;
    posture: string;
    framing: string;
    background: string;
  };
}

/**
 * Common technical requirements for all shots
 */
export interface CommonRequirements {
  resolution: string;
  lighting: string;
  focus: string;
  quality: string;
  veo3Ready: string;
  avoidanceList: string[];
}

/**
 * Shot types configuration structure
 */
export interface ShotTypesConfig {
  shotTypes: ShotTypeConfig[];
  commonRequirements: CommonRequirements;
  metadata: {
    version: string;
    lastUpdated: string;
    totalShots: number;
    defaultGeneration: string;
    estimatedCostPerShot: number;
    estimatedTimePerShot: number;
  };
}

/**
 * Physical template for character appearance
 */
export interface PhysicalTemplate {
  ageRange: [number, number];
  genderOptions: ('male' | 'female' | 'non-binary')[];
  defaultGender: 'male' | 'female' | 'non-binary';
  styleDescriptors: string[];
}

/**
 * Style template for character attire and grooming
 */
export interface StyleTemplate {
  attire: string[];
  grooming: string;
  accessories: string[];
  hairStyle: string;
  makeupStyle: string;
}

/**
 * Professional context for character role
 */
export interface ProfessionalContext {
  defaultProfession: string;
  settings: string[];
  messagingThemes: string[];
  brandIntegration?: {
    name: string;
    colors: string[];
    style: string;
  };
}

/**
 * Realism configuration for natural appearance
 */
export interface RealismConfig {
  skinRealism: boolean;
  naturalImperfections: boolean;
  avoidFeminineFeatures: boolean;
  emphasizeProfessionalism: boolean;
}

/**
 * Complete character preset definition
 */
export interface CharacterPreset {
  id: string;
  name: string;
  category: 'business' | 'influencer' | 'healthcare' | 'creative' | 'lifestyle';
  description: string;
  icon: string;
  physicalTemplate: PhysicalTemplate;
  styleTemplate: StyleTemplate;
  professionalContext: ProfessionalContext;
  realismConfig: RealismConfig;
}

/**
 * Character presets collection
 */
export interface CharacterPresetsConfig {
  presets: CharacterPreset[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalPresets: number;
    categories: string[];
    defaultPreset: string;
  };
}

/**
 * User customizations for a character preset
 */
export interface CharacterCustomization {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  ethnicity?: string;
  profession?: string;
  customDescriptors?: string[];
  physicalFeatures?: {
    eyeColor?: string;
    hairColor?: string;
    hairStyle?: string;
    facialHair?: string;
    skinTone?: string;
    height?: string;
    buildType?: string;
    distinctiveFeatures?: string[];
  };
  styleOverrides?: {
    attire?: string[];
    accessories?: string[];
  };
}

/**
 * Shot selection options
 */
export type ShotSelection = 'all' | string[];

/**
 * Generation options
 */
export interface GenerationOptions {
  greenScreen: boolean;
  generateMetadata: boolean;
  generateUsageGuide: boolean;
  temperature?: number; // For AI model (default 0.3)
}

/**
 * Character library generation request
 */
export interface CharacterLibraryRequest {
  presetId: string;
  customizations: CharacterCustomization;
  shotSelection: ShotSelection;
  options: GenerationOptions;
}

/**
 * Generation progress status
 */
export interface GenerationProgress {
  totalShots: number;
  completedShots: number;
  currentShot: string | null;
  estimatedTimeRemaining: number; // in seconds
}

/**
 * Cost breakdown
 */
export interface CostBreakdown {
  perImage: number;
  total: number;
  currency: 'USD';
}

/**
 * Single shot generation result
 */
export interface ShotResult {
  shotType: string;
  aspectRatio: string;
  imagePath?: string;
  success: boolean;
  error?: string;
  prompt?: string;
  timestamp?: string;
}

/**
 * Character library generation response
 */
export interface CharacterLibraryResponse {
  operationId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: GenerationProgress;
  costs: CostBreakdown;
  outputLocation: string;
  results?: ShotResult[];
  metadata?: {
    character: string;
    totalImages: number;
    successfulImages: number;
    successRate: string;
    shotTypes: string[];
    greenScreenShots: string[];
  };
}

/**
 * Preset manager operations
 */
export interface PresetManager {
  loadPresets(): Promise<CharacterPresetsConfig>;
  getPreset(presetId: string): Promise<CharacterPreset | null>;
  listPresets(category?: string): Promise<CharacterPreset[]>;
  validatePreset(preset: CharacterPreset): boolean;
  exportPreset(presetId: string): Promise<CharacterPreset>;
}

/**
 * Batch generator operations
 */
export interface BatchCharacterGenerator {
  generate(request: CharacterLibraryRequest): Promise<CharacterLibraryResponse>;
  getStatus(operationId: string): Promise<CharacterLibraryResponse>;
  cancel(operationId: string): Promise<boolean>;
}

/**
 * Character identity for consistency across shots
 */
export interface CharacterIdentity {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  ethnicity: string;
  profession: string;
  baseDescription: string;
  facialFeatures: {
    eyeShape: string;
    eyeColor: string;
    eyebrows: string;
    noseShape: string;
    lipShape: string;
    jawline: string;
    cheekbones: string;
    faceShape: string;
  };
  facialHair?: string;
  hairStyle: string;
  skinTone: string;
  bodyType: string;
  height?: string;
  distinctiveMarks: string[];
}

/**
 * Generated prompt for character
 */
export interface GeneratedCharacterPrompt {
  basePrompt: string;
  shotTypePrompts: Map<string, string>;
  characterIdentity: CharacterIdentity;
}

/**
 * Preset to prompt converter
 */
export interface PromptGenerator {
  generateFromPreset(
    preset: CharacterPreset,
    customizations: CharacterCustomization,
    shotType: ShotTypeConfig
  ): string;

  generateCharacterIdentity(
    preset: CharacterPreset,
    customizations: CharacterCustomization
  ): CharacterIdentity;
}