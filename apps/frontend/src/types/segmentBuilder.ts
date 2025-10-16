/**
 * Segment Builder Types - Dual Mode System
 *
 * Simple Mode: 16 essential controls for 90% of users
 * Power Mode: 50+ professional controls for advanced creators
 *
 * Based on 2025 industry research: VEO3, Sora 2, Runway Gen-3, Google Flow
 */

// ============================================================================
// MODE TYPES
// ============================================================================

export type AdvancedMode = 'simple' | 'power';

// ============================================================================
// SIMPLE MODE CONFIGURATION (16 Controls)
// ============================================================================

export interface SimpleSegmentConfig {
  mode: 'simple';

  // Basic
  preset?: string;
  dialogue: string;

  // Character (4 controls)
  character: {
    gender: Gender;
    ageRange: AgeRange;
    profession: Profession;
    expression: SimpleExpression;
  };

  // Camera (4 controls)
  camera: {
    motion: SimpleCameraMotion;
    angle: SimpleCameraAngle;
    framing: SimpleFraming;
    position: SimpleCameraPosition;
  };

  // Lighting (3 controls)
  lighting: {
    mood: SimpleLightingMood;
    timeOfDay: SimpleTimeOfDay;
    style: SimpleLightingStyle;
  };

  // Environment (2 controls)
  environment: {
    location: SimpleLocation;
    atmosphere: SimpleAtmosphere;
  };

  // Technical (2 controls)
  technical: {
    aspectRatio: AspectRatio;
    duration: Duration;
  };
}

// ============================================================================
// POWER MODE CONFIGURATION (50+ Controls)
// ============================================================================

export interface PowerSegmentConfig {
  mode: 'power';

  // Basic Settings (6 params)
  preset?: string;
  dialogue: string;
  style: VideoStyle;
  quality: Quality;
  aspectRatio: AspectRatio;
  duration: Duration;

  // Character (11 params)
  character: PowerCharacterSettings;

  // Camera (9 params)
  camera: PowerCameraSettings;

  // Lighting (nested sources array + 4 main params)
  lighting: PowerLightingSettings;

  // Environment (9 params)
  environment: PowerEnvironmentSettings;

  // Props & Objects
  props: PropsSettings;

  // Audio (5 main structures)
  audio: AudioSettings;

  // Color Grading (4 params)
  colorGrading: ColorGradingSettings;

  // Special Effects (4 params)
  specialEffects: SpecialEffectsSettings;

  // Speed & Constraints
  speedControl: SpeedControlSettings;
  constraints: ConstraintsSettings;
  ending: EndingSettings;
}

// ============================================================================
// POWER MODE: CHARACTER SETTINGS (11 parameters)
// ============================================================================

export interface PowerCharacterSettings {
  name?: string;
  gender: Gender;
  age: number; // 18-80
  ethnicity?: string;
  profession?: string;
  emotion: Emotion;
  pose: CharacterPose;
  movement: CharacterMovement;
  actions: CharacterAction[];
  clothing?: string;
  hair?: string;
  distanceToCamera?: number; // 1-10 meters
}

// ============================================================================
// POWER MODE: CAMERA SETTINGS (9 parameters)
// ============================================================================

export interface PowerCameraSettings {
  lens: CameraLens;
  aperture: Aperture;
  angle: CameraAngle;
  framing: CameraFraming;
  movement: CameraMovement;
  focusBehavior: FocusBehavior;
  shutterSpeed: ShutterSpeed;
  fieldOfView: number; // 40-120 degrees
  stabilization: Stabilization;
}

// ============================================================================
// POWER MODE: LIGHTING SETTINGS (nested sources + 4 params)
// ============================================================================

export interface PowerLightingSettings {
  sources: LightingSource[];
  mood: LightingMood;
  colorPalette?: string;
  specialEffects: LightingEffect[];
}

export interface LightingSource {
  type: LightingSourceType;
  intensity: Intensity;
  color: LightColor;
  position: LightPosition;
  directionality: Directionality;
}

// ============================================================================
// POWER MODE: ENVIRONMENT SETTINGS (9 parameters)
// ============================================================================

export interface PowerEnvironmentSettings {
  location: Location;
  timeOfDay: TimeOfDay;
  weather: Weather;
  era: Era;
  geography: Geography;
  materials: Material[];
  physics: PhysicsEffect[];
  atmosphere: AtmosphereQuality;
  backgroundElements?: string[];
}

// ============================================================================
// POWER MODE: PROPS SETTINGS
// ============================================================================

export interface PropsSettings {
  items: PropItem[];
  custom?: string;
}

// ============================================================================
// POWER MODE: AUDIO SETTINGS (5 main structures)
// ============================================================================

export interface AudioSettings {
  ambient: AmbientSound[];
  soundEffects: SoundEffect[];
  music?: MusicSettings;
  dialogue: DialogueEntry[];
  voiceOver?: string;
}

export interface MusicSettings {
  genre: MusicGenre;
  mood: MusicMood;
  volume: Volume;
}

export interface DialogueEntry {
  character: string;
  line: string;
  sync: DialogueSync;
}

// ============================================================================
// POWER MODE: COLOR GRADING SETTINGS (4 parameters)
// ============================================================================

export interface ColorGradingSettings {
  warmth: Warmth;
  contrast: Contrast;
  saturation: Saturation;
  look: ColorLook;
}

// ============================================================================
// POWER MODE: SPECIAL EFFECTS SETTINGS (4 parameters)
// ============================================================================

export interface SpecialEffectsSettings {
  motionBlur: MotionBlur;
  lensFlares: boolean;
  particleEffects: ParticleEffect[];
  reflectionEffects: ReflectionEffect[];
}

// ============================================================================
// POWER MODE: SPEED CONTROL SETTINGS
// ============================================================================

export interface SpeedControlSettings {
  slowMotion: SlowMotion;
  timeLapse: TimeLapse;
  ramping: Ramping;
  freezeFrame: FreezeFrame;
}

// ============================================================================
// POWER MODE: CONSTRAINTS & ENDING
// ============================================================================

export interface ConstraintsSettings {
  exclude: string[];
  keywords: string[];
}

export interface EndingSettings {
  fadeOut: FadeOut;
  duration: FadeDuration;
}

// ============================================================================
// BACKWARD COMPATIBILITY: Original Config (12 parameters)
// ============================================================================

export interface SegmentBuilderConfig {
  dialogue: string;
  props: string[];
  camera: CameraSettings;
  lighting: LightingSettings;
  character: CharacterSettings;
  environment: EnvironmentSettings;
}

export interface CameraSettings {
  motion: CameraMotion;
  angle: CameraAngle;
  lens: CameraLens;
  position: CameraPosition;
}

export interface LightingSettings {
  mood: LightingMood;
  timeOfDay: TimeOfDay;
  style: LightingStyle;
}

export interface CharacterSettings {
  action: CharacterAction;
  expression: CharacterExpression;
  bodyLanguage: BodyLanguage;
}

export interface EnvironmentSettings {
  location: Location;
  atmosphere: Atmosphere;
}

// ============================================================================
// ENUMS: SIMPLE MODE
// ============================================================================

export type Gender = 'male' | 'female' | 'non-binary' | 'other';

export type AgeRange = '20s' | '30s' | '40s' | '50s+';

export type Profession =
  | 'insurance_agent'
  | 'presenter'
  | 'expert'
  | 'influencer'
  | 'educator'
  | 'professional';

export type SimpleExpression =
  | 'neutral'
  | 'friendly'
  | 'confident'
  | 'enthusiastic';

export type SimpleCameraMotion =
  | 'static'
  | 'slow_pan'
  | 'dolly_in'
  | 'handheld';

export type SimpleCameraAngle =
  | 'eye_level'
  | 'high_angle'
  | 'low_angle';

export type SimpleFraming =
  | 'close_up'
  | 'medium'
  | 'wide';

export type SimpleCameraPosition =
  | 'front'
  | 'side'
  | 'over_shoulder';

export type SimpleLightingMood =
  | 'natural'
  | 'dramatic'
  | 'soft';

export type SimpleTimeOfDay =
  | 'morning'
  | 'midday'
  | 'golden_hour'
  | 'night';

export type SimpleLightingStyle =
  | 'professional'
  | 'cinematic'
  | 'natural';

export type SimpleLocation =
  | 'office'
  | 'studio'
  | 'outdoor'
  | 'car'
  | 'home';

export type SimpleAtmosphere =
  | 'professional'
  | 'casual'
  | 'energetic'
  | 'calm';

// ============================================================================
// ENUMS: POWER MODE - CHARACTER
// ============================================================================

export type Emotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted'
  | 'contemptuous'
  | 'determined'
  | 'confident'
  | 'friendly'
  | 'enthusiastic'
  | 'calm'
  | 'excited'
  | 'serious'
  | 'warm'
  | 'professional'
  | 'thoughtful'
  | 'curious'
  | 'skeptical';

export type CharacterPose =
  | 'standing'
  | 'sitting'
  | 'walking'
  | 'gesturing'
  | 'leaning'
  | 'pointing';

export type CharacterMovement =
  | 'steady'
  | 'dynamic'
  | 'subtle'
  | 'energetic'
  | 'relaxed';

export type CharacterAction =
  | 'speaking'
  | 'demonstrating'
  | 'gesturing'
  | 'presenting'
  | 'explaining'
  | 'pointing'
  | 'holding_props'
  | 'walking'
  | 'looking_at_camera'
  | 'looking_away'
  | 'checking_device'
  | 'writing'
  | 'reading';

// ============================================================================
// ENUMS: POWER MODE - CAMERA
// ============================================================================

export type CameraLens =
  | '24mm'
  | '35mm'
  | '50mm'
  | '85mm'
  | '200mm'
  | 'wide_24mm'
  | 'standard_50mm'
  | 'portrait_85mm'
  | 'telephoto_200mm';

export type Aperture =
  | 'f/1.4'
  | 'f/2.8'
  | 'f/5.6'
  | 'f/8'
  | 'f/11'
  | 'f/16';

export type CameraAngle =
  | 'eye_level'
  | 'low_angle'
  | 'high_angle'
  | 'dutch_angle'
  | 'over_shoulder'
  | 'birds_eye'
  | 'worms_eye'
  | 'top_down';

export type CameraFraming =
  | 'extreme_close_up'
  | 'close_up'
  | 'medium_close_up'
  | 'medium'
  | 'medium_wide'
  | 'full_body'
  | 'wide_shot'
  | 'extreme_wide';

export type CameraMovement =
  | 'static'
  | 'pan'
  | 'tilt'
  | 'dolly_in'
  | 'dolly_out'
  | 'crane'
  | 'handheld'
  | 'steadicam'
  | 'slow_pan'
  | 'follow'
  | 'orbit'
  | 'crane_up'
  | 'crane_down';

export type FocusBehavior =
  | 'rack_focus'
  | 'deep_focus'
  | 'shallow_focus'
  | 'tilt_shift';

export type ShutterSpeed =
  | '1/30s'
  | '1/60s'
  | '1/120s'
  | '1/250s'
  | '1/500s';

export type Stabilization =
  | 'smooth'
  | 'subtle_shake'
  | 'handheld_shake'
  | 'none';

// ============================================================================
// ENUMS: POWER MODE - LIGHTING
// ============================================================================

export type LightingSourceType =
  | 'natural'
  | 'neon'
  | 'artificial'
  | 'practical'
  | 'rim'
  | 'fill'
  | 'key'
  | 'backlight';

export type Intensity =
  | 'high'
  | 'medium'
  | 'low';

export type LightColor =
  | 'cool_blue'
  | 'warm_amber'
  | 'neutral'
  | 'green'
  | 'magenta'
  | 'red'
  | 'white';

export type LightPosition =
  | 'left'
  | 'right'
  | 'overhead'
  | 'behind'
  | 'floor'
  | 'front';

export type Directionality =
  | 'side'
  | 'front'
  | 'back'
  | 'diagonal';

export type LightingMood =
  | 'natural'
  | 'cinematic'
  | 'dramatic'
  | 'soft'
  | 'high_key'
  | 'low_key'
  | 'vibrant'
  | 'moody'
  | 'bright';

export type LightingEffect =
  | 'lens_flare'
  | 'god_rays'
  | 'rim_light'
  | 'reflections';

export type LightingStyle =
  | 'studio'
  | 'outdoor'
  | 'window_light'
  | 'motivated'
  | 'three_point'
  | 'rembrandt'
  | 'butterfly';

// ============================================================================
// ENUMS: POWER MODE - ENVIRONMENT
// ============================================================================

export type Location =
  | 'modern_office'
  | 'car_interior'
  | 'outdoor_street'
  | 'home_living_room'
  | 'studio_backdrop'
  | 'cafe'
  | 'conference_room'
  | 'retail_space'
  | 'urban_alley'
  | 'park'
  | 'beach'
  | 'forest'
  | 'rooftop'
  | 'parking_lot'
  | 'subway'
  | 'airport'
  | 'restaurant'
  | 'gym'
  | 'warehouse'
  | 'library'
  | 'hospital'
  | 'school'
  | 'factory'
  | 'construction_site'
  | 'farm'
  | 'mountains'
  | 'desert'
  | 'underwater'
  | 'space';

export type TimeOfDay =
  | 'dawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'golden_hour'
  | 'dusk'
  | 'evening'
  | 'night'
  | 'blue_hour';

export type Weather =
  | 'sunny'
  | 'overcast'
  | 'light_rain'
  | 'drizzle'
  | 'heavy_rain'
  | 'snow'
  | 'fog'
  | 'mist'
  | 'windy'
  | 'stormy'
  | 'clear';

export type Era =
  | '1920s'
  | '1950s'
  | '1970s'
  | '1980s'
  | '1990s'
  | '2000s'
  | 'modern'
  | '2080s'
  | 'futuristic';

export type Geography =
  | 'urban'
  | 'suburban'
  | 'rural'
  | 'coastal'
  | 'desert'
  | 'forest'
  | 'mountain'
  | 'tropical'
  | 'arctic';

export type Material =
  | 'glass'
  | 'wood'
  | 'metal'
  | 'fabric'
  | 'concrete'
  | 'brick'
  | 'plastic'
  | 'stone'
  | 'leather';

export type PhysicsEffect =
  | 'wind'
  | 'rain'
  | 'snow'
  | 'dust'
  | 'mist'
  | 'smoke'
  | 'fog'
  | 'leaves'
  | 'sparks';

export type AtmosphereQuality =
  | 'humid'
  | 'dry'
  | 'misty'
  | 'clear'
  | 'hazy'
  | 'crisp';

export type Atmosphere =
  | 'professional'
  | 'casual'
  | 'modern'
  | 'warm'
  | 'tech_forward'
  | 'corporate'
  | 'friendly'
  | 'dynamic';

// ============================================================================
// ENUMS: POWER MODE - PROPS & AUDIO
// ============================================================================

export type PropItem =
  | 'laptop'
  | 'phone'
  | 'documents'
  | 'coffee'
  | 'car_keys'
  | 'product_box'
  | 'signage'
  | 'tablet'
  | 'headphones'
  | 'bag'
  | 'book'
  | 'pen'
  | 'clipboard'
  | 'microphone';

export type AmbientSound =
  | 'traffic'
  | 'rainfall'
  | 'birds'
  | 'wind'
  | 'office_buzz'
  | 'crowd'
  | 'ocean_waves'
  | 'city_noise'
  | 'nature'
  | 'silence';

export type SoundEffect =
  | 'footsteps'
  | 'door_slam'
  | 'glass_clink'
  | 'engine'
  | 'keyboard'
  | 'phone_ring'
  | 'notification'
  | 'car_horn'
  | 'applause';

export type MusicGenre =
  | 'ambient'
  | 'synthwave'
  | 'classical'
  | 'rock'
  | 'electronic'
  | 'corporate'
  | 'jazz'
  | 'orchestral'
  | 'lo-fi';

export type MusicMood =
  | 'tense'
  | 'uplifting'
  | 'melancholic'
  | 'energetic'
  | 'calm'
  | 'dramatic'
  | 'inspiring'
  | 'mysterious';

export type Volume =
  | 'low'
  | 'medium'
  | 'high';

export type DialogueSync =
  | 'natural'
  | 'fast'
  | 'slow';

// ============================================================================
// ENUMS: POWER MODE - COLOR GRADING & EFFECTS
// ============================================================================

export type Warmth =
  | 'cool'
  | 'neutral'
  | 'warm';

export type Contrast =
  | 'low'
  | 'medium'
  | 'high';

export type Saturation =
  | 'low'
  | 'medium'
  | 'high';

export type ColorLook =
  | 'cinematic'
  | 'flat'
  | 'vintage'
  | 'HDR'
  | 'desaturated'
  | 'vibrant'
  | 'noir';

export type MotionBlur =
  | 'none'
  | 'subtle'
  | 'strong';

export type ParticleEffect =
  | 'mist'
  | 'dust'
  | 'smoke'
  | 'sparks'
  | 'rain'
  | 'snow'
  | 'embers'
  | 'confetti';

export type ReflectionEffect =
  | 'mirror_puddles'
  | 'glass_reflections'
  | 'water'
  | 'chrome';

// ============================================================================
// ENUMS: POWER MODE - SPEED CONTROL
// ============================================================================

export type SlowMotion =
  | 'None'
  | '2x'
  | '4x'
  | '8x';

export type TimeLapse =
  | 'None'
  | '10x'
  | '100x'
  | '1000x';

export type Ramping =
  | 'None'
  | 'speed_up'
  | 'slow_down'
  | 'accelerate_decelerate';

export type FreezeFrame =
  | 'None'
  | 'at_2s'
  | 'at_4s'
  | 'at_6s';

export type FadeOut =
  | 'none'
  | 'to_black'
  | 'to_white';

export type FadeDuration =
  | '0.5s'
  | '1s'
  | '2s';

// ============================================================================
// ENUMS: TECHNICAL SETTINGS
// ============================================================================

export type VideoStyle =
  | 'cinematic'
  | 'documentary'
  | 'animation'
  | 'commercial'
  | 'vlog'
  | 'corporate';

export type Quality =
  | 'high'
  | 'medium'
  | 'low';

export type AspectRatio =
  | '16:9'
  | '9:16'
  | '1:1'
  | '4:5';

export type Duration =
  | '4s'
  | '6s'
  | '8s'
  | '10s';

// ============================================================================
// LEGACY ENUMS (Backward Compatibility)
// ============================================================================

export type CameraMotion =
  | 'static'
  | 'slow_pan'
  | 'follow'
  | 'orbit'
  | 'dolly_in'
  | 'dolly_out'
  | 'crane_up'
  | 'crane_down';

export type CameraPosition =
  | 'extreme_close_up'
  | 'close_up'
  | 'medium_close_up'
  | 'medium'
  | 'medium_wide'
  | 'full_body'
  | 'wide_shot'
  | 'extreme_wide';

export type CharacterExpression =
  | 'friendly'
  | 'professional'
  | 'excited'
  | 'calm'
  | 'enthusiastic'
  | 'confident'
  | 'warm'
  | 'serious';

export type BodyLanguage =
  | 'confident'
  | 'open'
  | 'inviting'
  | 'authoritative'
  | 'relaxed'
  | 'energetic'
  | 'formal'
  | 'casual';

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

export interface SegmentPreset {
  name: string;
  description: string;
  defaults: SegmentBuilderConfig;
}

export const SEGMENT_PRESETS: Record<string, SegmentPreset> = {
  talking_head: {
    name: 'Talking Head',
    description: 'Professional presenter style (ideal for QuoteMoto)',
    defaults: {
      dialogue: '',
      props: [],
      camera: {
        motion: 'static',
        angle: 'eye_level',
        lens: 'portrait_85mm',
        position: 'medium_close_up'
      },
      lighting: {
        mood: 'natural',
        timeOfDay: 'afternoon',
        style: 'window_light'
      },
      character: {
        action: 'speaking',
        expression: 'friendly',
        bodyLanguage: 'confident'
      },
      environment: {
        location: 'modern_office',
        atmosphere: 'professional'
      }
    }
  },
  product_demo: {
    name: 'Product Demo',
    description: 'Showcasing product features with props',
    defaults: {
      dialogue: '',
      props: [],
      camera: {
        motion: 'slow_pan',
        angle: 'eye_level',
        lens: 'standard_50mm',
        position: 'medium'
      },
      lighting: {
        mood: 'cinematic',
        timeOfDay: 'afternoon',
        style: 'three_point'
      },
      character: {
        action: 'demonstrating',
        expression: 'enthusiastic',
        bodyLanguage: 'open'
      },
      environment: {
        location: 'studio_backdrop',
        atmosphere: 'modern'
      }
    }
  },
  storytelling: {
    name: 'Storytelling',
    description: 'Narrative-driven with emotional engagement',
    defaults: {
      dialogue: '',
      props: [],
      camera: {
        motion: 'dolly_in',
        angle: 'low_angle',
        lens: 'wide_24mm',
        position: 'full_body'
      },
      lighting: {
        mood: 'dramatic',
        timeOfDay: 'golden_hour',
        style: 'motivated'
      },
      character: {
        action: 'explaining',
        expression: 'warm',
        bodyLanguage: 'inviting'
      },
      environment: {
        location: 'outdoor_street',
        atmosphere: 'casual'
      }
    }
  },
  educational: {
    name: 'Educational',
    description: 'Clear, informative presentation',
    defaults: {
      dialogue: '',
      props: [],
      camera: {
        motion: 'static',
        angle: 'eye_level',
        lens: 'standard_50mm',
        position: 'medium'
      },
      lighting: {
        mood: 'high_key',
        timeOfDay: 'midday',
        style: 'studio'
      },
      character: {
        action: 'presenting',
        expression: 'professional',
        bodyLanguage: 'authoritative'
      },
      environment: {
        location: 'conference_room',
        atmosphere: 'corporate'
      }
    }
  }
};

// ============================================================================
// HUMAN-READABLE LABELS FOR DROPDOWNS
// ============================================================================

export const LABELS = {
  // Power Mode - Basic Settings
  videoStyle: {
    cinematic: 'Cinematic (Film-like)',
    documentary: 'Documentary (Real, authentic)',
    animation: 'Animation (Stylized)',
    commercial: 'Commercial (Advertising)',
    vlog: 'Vlog (Personal, casual)',
    corporate: 'Corporate (Professional)'
  },
  quality: {
    high: 'High (Best quality)',
    medium: 'Medium (Balanced)',
    low: 'Low (Fast generation)'
  },

  // Simple Mode Labels
  gender: {
    male: 'Male',
    female: 'Female',
    'non-binary': 'Non-binary',
    other: 'Other'
  },
  ageRange: {
    '20s': '20s',
    '30s': '30s',
    '40s': '40s',
    '50s+': '50s+'
  },
  profession: {
    insurance_agent: 'Insurance Agent',
    presenter: 'Presenter',
    expert: 'Expert/Specialist',
    influencer: 'Influencer/Creator',
    educator: 'Educator/Teacher',
    professional: 'Professional'
  },
  simpleExpression: {
    neutral: 'Neutral',
    friendly: 'Friendly',
    confident: 'Confident',
    enthusiastic: 'Enthusiastic'
  },

  // Camera Labels (combined simple + power)
  cameraMotion: {
    static: 'Static (No movement)',
    slow_pan: 'Slow Pan (Gentle sweep)',
    follow: 'Follow (Track character)',
    orbit: 'Orbit (Circle around)',
    dolly_in: 'Dolly In (Push forward)',
    dolly_out: 'Dolly Out (Pull back)',
    crane_up: 'Crane Up (Rise)',
    crane_down: 'Crane Down (Lower)',
    handheld: 'Handheld (Realistic shake)',
    pan: 'Pan (Left/right sweep)',
    tilt: 'Tilt (Up/down movement)',
    crane: 'Crane (Complex movement)',
    steadicam: 'Steadicam (Smooth tracking)'
  },
  cameraAngle: {
    eye_level: 'Eye Level (Neutral)',
    low_angle: 'Low Angle (Look up, powerful)',
    high_angle: 'High Angle (Look down, intimate)',
    dutch_angle: 'Dutch Angle (Tilted, dynamic)',
    over_shoulder: 'Over Shoulder (POV style)',
    birds_eye: "Bird's Eye (Directly above)",
    worms_eye: "Worm's Eye (Directly below)",
    top_down: 'Top Down (Overhead view)'
  },
  cameraLens: {
    '24mm': '24mm (Wide angle)',
    '35mm': '35mm (Standard wide)',
    '50mm': '50mm (Natural perspective)',
    '85mm': '85mm (Portrait)',
    '200mm': '200mm (Telephoto)',
    wide_24mm: 'Wide 24mm (Expansive view)',
    standard_50mm: 'Standard 50mm (Natural perspective)',
    portrait_85mm: 'Portrait 85mm (Flattering, professional)',
    telephoto_200mm: 'Telephoto 200mm (Compressed, intimate)'
  },
  framing: {
    extreme_close_up: 'Extreme Close-up (Face detail)',
    close_up: 'Close-up (Head & shoulders)',
    medium_close_up: 'Medium Close-up (Chest up)',
    medium: 'Medium (Waist up)',
    medium_wide: 'Medium Wide (Knees up)',
    full_body: 'Full Body (Head to toe)',
    wide_shot: 'Wide Shot (Full scene)',
    extreme_wide: 'Extreme Wide (Panoramic)'
  },
  cameraPosition: {
    front: 'Front (Facing camera)',
    side: 'Side (Profile view)',
    over_shoulder: 'Over Shoulder (Behind character)'
  },

  // Lighting Labels
  lightingMood: {
    natural: 'Natural (Realistic)',
    cinematic: 'Cinematic (Film-like)',
    dramatic: 'Dramatic (High contrast)',
    soft: 'Soft (Gentle, flattering)',
    high_key: 'High-key (Bright, positive)',
    low_key: 'Low-key (Dark, moody)',
    vibrant: 'Vibrant (Colorful, energetic)',
    moody: 'Moody (Atmospheric)',
    bright: 'Bright (Well-lit)'
  },
  timeOfDay: {
    dawn: 'Dawn (Early morning)',
    morning: 'Morning (Fresh, awakening)',
    midday: 'Midday (Bright, clear)',
    afternoon: 'Afternoon (Warm, pleasant)',
    golden_hour: 'Golden Hour (Magic hour glow)',
    dusk: 'Dusk (Sunset)',
    evening: 'Evening (Settling, calm)',
    night: 'Night (Dark, mysterious)',
    blue_hour: 'Blue Hour (Twilight blue)'
  },
  lightingStyle: {
    studio: 'Studio (Controlled, even)',
    outdoor: 'Outdoor (Natural sun)',
    window_light: 'Window Light (Soft, directional)',
    motivated: 'Motivated (Realistic sources)',
    three_point: 'Three-point (Classic setup)',
    rembrandt: 'Rembrandt (Dramatic triangle)',
    butterfly: 'Butterfly (Glamour, beauty)',
    professional: 'Professional',
    cinematic: 'Cinematic',
    natural: 'Natural'
  },

  // Character Labels (combined)
  characterAction: {
    speaking: 'Speaking (Talking to camera)',
    demonstrating: 'Demonstrating (Showing something)',
    gesturing: 'Gesturing (Hand movements)',
    presenting: 'Presenting (Formal delivery)',
    explaining: 'Explaining (Teaching)',
    pointing: 'Pointing (Directing attention)',
    holding_props: 'Holding Props (Physical interaction)',
    walking: 'Walking (Moving through scene)',
    looking_at_camera: 'Looking at Camera',
    looking_away: 'Looking Away',
    checking_device: 'Checking Device',
    writing: 'Writing',
    reading: 'Reading'
  },
  characterExpression: {
    friendly: 'Friendly (Approachable)',
    professional: 'Professional (Business-like)',
    excited: 'Excited (High energy)',
    calm: 'Calm (Peaceful, relaxed)',
    enthusiastic: 'Enthusiastic (Passionate)',
    confident: 'Confident (Self-assured)',
    warm: 'Warm (Kind, caring)',
    serious: 'Serious (Focused, important)'
  },
  bodyLanguage: {
    confident: 'Confident (Strong posture)',
    open: 'Open (Welcoming arms)',
    inviting: 'Inviting (Drawing in)',
    authoritative: 'Authoritative (Commanding)',
    relaxed: 'Relaxed (At ease)',
    energetic: 'Energetic (Dynamic movement)',
    formal: 'Formal (Professional stance)',
    casual: 'Casual (Laid-back)'
  },

  // Environment Labels
  location: {
    modern_office: 'Modern Office (Clean, professional)',
    car_interior: 'Car Interior (Automotive setting)',
    outdoor_street: 'Outdoor Street (Urban environment)',
    home_living_room: 'Home Living Room (Cozy, personal)',
    studio_backdrop: 'Studio Backdrop (Neutral, controlled)',
    cafe: 'Café (Casual, social)',
    conference_room: 'Conference Room (Corporate)',
    retail_space: 'Retail Space (Commercial)',
    office: 'Office',
    studio: 'Studio',
    outdoor: 'Outdoor',
    car: 'Car',
    home: 'Home'
  },
  atmosphere: {
    professional: 'Professional (Business-focused)',
    casual: 'Casual (Relaxed vibe)',
    modern: 'Modern (Contemporary style)',
    warm: 'Warm (Inviting feel)',
    tech_forward: 'Tech-forward (Innovative)',
    corporate: 'Corporate (Formal, structured)',
    friendly: 'Friendly (Approachable)',
    dynamic: 'Dynamic (Energetic, active)',
    energetic: 'Energetic',
    calm: 'Calm'
  },

  // Technical
  aspectRatio: {
    '16:9': '16:9 (Widescreen)',
    '9:16': '9:16 (Vertical/Stories)',
    '1:1': '1:1 (Square)',
    '4:5': '4:5 (Instagram Portrait)'
  },
  duration: {
    '4s': '4 seconds',
    '6s': '6 seconds',
    '8s': '8 seconds',
    '10s': '10 seconds'
  }
};

// ==================== SIMPLE MODE LABELS ====================
// Simplified labels for Simple Mode (16 controls)
export const SIMPLE_LABELS = {
  // Character (4 controls)
  gender: {
    male: 'Male',
    female: 'Female',
    non_binary: 'Non-binary'
  },
  ageRange: {
    young_adult_18_29: 'Young Adult (18-29)',
    adult_30_45: 'Adult (30-45)',
    mature_46_60: 'Mature (46-60)',
    senior_60_plus: 'Senior (60+)'
  },
  profession: {
    professional: 'Professional / Business',
    creative: 'Creative / Artistic',
    technical: 'Technical / Engineer',
    service: 'Service Industry',
    educator: 'Educator / Teacher',
    healthcare: 'Healthcare Worker',
    sales: 'Sales / Marketing',
    casual: 'Casual / Everyday'
  },
  expression: {
    friendly: 'Friendly',
    confident: 'Confident',
    enthusiastic: 'Enthusiastic',
    professional: 'Professional',
    warm: 'Warm',
    serious: 'Serious',
    relaxed: 'Relaxed'
  },

  // Camera (4 controls)
  cameraMotion: {
    static: 'Static (No movement)',
    slow_pan: 'Slow Pan',
    slow_zoom: 'Slow Zoom In',
    gentle_dolly: 'Gentle Dolly'
  },
  cameraAngle: {
    eye_level: 'Eye Level',
    slightly_low: 'Slightly Low',
    slightly_high: 'Slightly High',
    over_shoulder: 'Over Shoulder'
  },
  framing: {
    close_up: 'Close-up (Face)',
    medium_close_up: 'Medium Close-up (Head & Shoulders)',
    medium_shot: 'Medium Shot (Waist up)',
    medium_wide: 'Medium Wide (Full body with space)'
  },
  cameraPosition: {
    center: 'Center',
    slightly_left: 'Slightly Left',
    slightly_right: 'Slightly Right'
  },

  // Lighting (3 controls)
  lightingMood: {
    natural: 'Natural',
    soft: 'Soft',
    bright: 'Bright',
    dramatic: 'Dramatic',
    warm: 'Warm'
  },
  timeOfDay: {
    morning: 'Morning (Soft light)',
    midday: 'Midday (Bright)',
    afternoon: 'Afternoon (Golden hour)',
    evening: 'Evening (Warm tones)',
    overcast: 'Overcast (Diffused)'
  },
  lightingStyle: {
    soft: 'Soft (Flattering)',
    hard: 'Hard (Defined shadows)',
    balanced: 'Balanced (Mix)',
    backlit: 'Backlit (Rim lighting)',
    three_point: 'Three-point (Studio)'
  },

  // Environment (2 controls)
  location: {
    office: 'Office',
    home: 'Home',
    outdoor: 'Outdoor',
    car: 'Car',
    studio: 'Studio',
    cafe: 'Café',
    street: 'Street',
    retail: 'Retail Space'
  },
  atmosphere: {
    professional: 'Professional',
    casual: 'Casual',
    warm: 'Warm',
    modern: 'Modern',
    energetic: 'Energetic',
    calm: 'Calm',
    friendly: 'Friendly'
  },

  // Technical (2 controls)
  aspectRatio: {
    '16:9': '16:9 (Widescreen)',
    '9:16': '9:16 (Vertical/Stories)',
    '1:1': '1:1 (Square)',
    '4:5': '4:5 (Instagram)'
  },
  duration: {
    '4': '4 seconds',
    '6': '6 seconds',
    '8': '8 seconds'
  }
};
