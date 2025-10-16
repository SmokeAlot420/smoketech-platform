/**
 * NANO BANANA VERTEX AI - Production Implementation
 * Uses the REAL imagegeneration@006 and imagen-3.0-capability-001 endpoints
 */
export interface CharacterReference {
    id: string;
    name: string;
    description: string;
    referenceImage: string;
    createdAt: Date;
}
export interface GenerationOptions {
    prompt: string;
    characterRef?: CharacterReference;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    sampleCount?: number;
    safetyFilterLevel?: 'block_some' | 'block_few' | 'block_most';
    personGeneration?: 'allow_adult' | 'allow_all';
    addWatermark?: boolean;
}
export declare class NanoBananaVertex {
    private auth;
    private projectId;
    private location;
    private modelVersion;
    private accessToken;
    constructor(projectId: string, location?: string);
    /**
     * Get access token for API calls
     */
    private getAccessToken;
    /**
     * Create a character reference from an image
     */
    createCharacterReference(imagePath: string, name: string, description: string): Promise<CharacterReference>;
    /**
     * Generate image with character consistency
     */
    generateWithCharacter(options: GenerationOptions): Promise<Buffer[]>;
    /**
     * Generate multiple consistent images for a character
     */
    generateCharacterSeries(characterRef: CharacterReference, prompts: string[]): Promise<Buffer[][]>;
    /**
     * Load existing character reference
     */
    loadCharacterReference(characterId: string): Promise<CharacterReference>;
    /**
     * Helper method for delay
     */
    private delay;
}
export default NanoBananaVertex;
//# sourceMappingURL=nano-banana-vertex.d.ts.map