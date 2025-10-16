/**
 * TypeScript type definitions for shared configuration
 */

export interface PhysicalTemplate {
  ageRange: [number, number];
  genderOptions: string[];
  defaultGender: string;
  styleDescriptors: string[];
}

export interface StyleTemplate {
  attire: string[];
  grooming: string;
  accessories: string[];
  hairStyle: string;
  makeupStyle: string;
}

export interface BrandIntegration {
  name: string;
  colors: string[];
  style: string;
}

export interface ProfessionalContext {
  defaultProfession: string;
  settings: string[];
  messagingThemes: string[];
  brandIntegration?: BrandIntegration;
}

export interface RealismConfig {
  skinRealism: boolean;
  naturalImperfections: boolean;
  avoidFeminineFeatures: boolean;
  emphasizeProfessionalism: boolean;
}

export interface CharacterPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  physicalTemplate: PhysicalTemplate;
  styleTemplate: StyleTemplate;
  professionalContext: ProfessionalContext;
  realismConfig: RealismConfig;
}

export interface CharacterPresetsData {
  presets: CharacterPreset[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalPresets: number;
    categories: string[];
    defaultPreset: string;
  };
}

export interface TechnicalRequirements {
  composition: string;
  posture: string;
  framing: string;
  background: string;
}

export interface ShotType {
  id: string;
  name: string;
  description: string;
  aspectRatio: string;
  platform: string;
  useGreenScreen: boolean;
  promptModifications: string;
  technicalRequirements: TechnicalRequirements;
}

export interface CommonRequirements {
  resolution: string;
  lighting: string;
  focus: string;
  quality: string;
  veo3Ready: string;
  avoidanceList: string[];
}

export interface ShotTypesData {
  shotTypes: ShotType[];
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
