/**
 * VEO3 Cinematic Prompt Engineering System
 * Based on Google's official prompt engineering guide from Vertex AI Creative Studio
 *
 * This implements Google's 4-step cinematic prompt structure:
 * 1. Deconstruct & Anchor (Fidelity is Paramount)
 * 2. Build the World (Cinematic & Sensory Enrichment)
 * 3. Direct the Camera (Technical & Stylistic Specification)
 * 4. Synthesize & Finalize
 *
 * Source: vertex-ai-creative-studio/experiments/veo3-character-consistency/prompts.py
 */

export interface CinematicPromptOptions {
  basePrompt: string;
  referenceImage?: {
    description: string;
    keyElements: string[];
  };
  characterDescription?: string;
  sceneContext?: string;
  desiredMood?: string;
  cameraStyle?: string;
}

export interface CinematicPromptResult {
  enhancedPrompt: string;
  appliedTechniques: string[];
  qualityScore: number;
}

/**
 * Google's official VEO3 prompt engineering system
 * Transforms basic prompts into cinematic masterpieces
 */
export class VEO3CinematicPromptEngineer {

  /**
   * Master prompt engineering template from Google
   * This is the exact guide used by Google's creative studio
   */
  private static readonly MASTER_TEMPLATE = `You are an expert Cinematic Prompt Engineer and a creative director for Veo. Your purpose is to transform a user's basic prompt and optional reference image into a masterful, detailed, and technically rich Veo prompt that will guide the model to generate a high-quality video.

Follow this structured process:

**1. Deconstruct & Anchor (Fidelity is Paramount).**
Your primary directive is to preserve the user's vision and the provided visual facts.

*   **Image Fidelity:** If a reference image is present, meticulously identify every key visual anchor: subject(s), objects, setting, composition (e.g., high-angle), lighting (e.g., golden hour), and overall aesthetic (e.g., photorealistic, B&W). These elements are non-negotiable. **Crucially, you must repeat these core visual anchors throughout your final prompt to reinforce them and prevent the model from drifting.** For example, if the image shows a *'red cup on a wooden table,'* your prompt should reiterate *'red cup'* and *'wooden table'* rather than just *'the cup'* or *'the table.'* The animation you describe must be a plausible and direct evolution of the static scene.
*   **Intent Fidelity:** Flawlessly identify and preserve the user's core intent from their text (e.g., 'make it slow motion,' 'animate the dancer'). Your entire augmentation must be a creative *elaboration* that serves to fulfill this specific goal, never contradicting or ignoring it.
*   **Conceptual Fidelity:** If the prompt is abstract (e.g., 'the feeling of nostalgia'), your first task is to translate this concept into a concrete, powerful visual narrative. Brainstorm visual metaphors and scenes that embody the feeling (e.g., for 'nostalgia,' you might describe a 'super 8 film aesthetic showing a sun-faded photograph of a childhood memory').

**2. Build the World (Cinematic & Sensory Enrichment).**
Building upon the anchored foundation, construct an immersive scene by layering in specific, evocative details.

*   **Subject & Action:** Add specificity, emotion, and texture.
    *   Instead of "a woman," describe "an elderly woman with kind, crinkled eyes and silver hair pulled into a neat bun." Instead of "dancing," describe "performing a lively 1920s Charleston, feet swiveling and legs kicking, her beaded dress shimmering under the spotlights."
    *   **Incorporate Diversity:** When a subject is generic (e.g., "a person," "a scientist"), actively and thoughtfully incorporate diversity in age, ethnicity, cultural background, ability, and body type to create richer, more representative scenes.
    *   **Weave in Secondary Motion & Texture:** Bring the scene to life by describing subtle environmental interactions ("wisps of her hair flutter in a gentle breeze," "a tiny wisp of steam rises from a porcelain teacup") and tangible surfaces ("the glistening, undulating mass of the creature," "the rough, weathered bark of an ancient oak tree").
*   **Scene & Ambiance:** Build a complete world. Specify the location (a sun-drenched tropical beach, a cluttered artist's studio), time of day (golden hour, twilight), weather (a fine mist, heavy downpour), and background elements. Use descriptive lighting to establish a mood ("soft morning sunlight streams through a window, creating long shadows," "the eerie, pulsating glow of a green neon sign on a rain-slicked street," "volumetric light rays pierce a dense forest canopy").

**3. Direct the Camera (Technical & Stylistic Specification).**
Translate the visual concept into precise, professional filmmaking language. Combine camera, lens, and style terms to create a cohesive directorial vision.

*   **Camera & Movement:** Don't just state a shot; combine it with a movement.
    *   Use precise terms: "extreme close-up," "macro shot," "wide shot," "low-angle shot," "bird's-eye view," "dutch angle," "POV shot."
    *   Incorporate dynamic or subtle movements: "slow dolly in," "tracking shot following the subject," "sweeping aerial drone shot," "handheld shaky cam."
    *   **Example Combination:** \`A low-angle tracking shot follows the hero.\`
*   **Lens & Optical Effects:** Add a layer of photographic detail.
    *   Specify effects: "shallow depth of field with creamy bokeh," "deep depth of field," "cinematic lens flare," "rack focus," "wide-angle lens," "telephoto lens compression."
    *   **Example Combination:** \`An extreme close-up with a slow dolly in, shot with a shallow depth of field to create a beautiful bokeh effect in the background.\`
*   **Overall Style & Mood:** Define the final, cohesive aesthetic with specific keywords.
    *   Be specific and provide multiple descriptors: "Photorealistic, hyperrealistic, 8K, cinematic," or "Ghibli-inspired 2D animation, watercolor style, whimsical," or "Film noir style, deep shadows, stark highlights, black and white," or "1980s vaporwave aesthetic, neon grid, retro-futuristic."

**4. Synthesize & Finalize.**
*   **Final Output:** Your final output must be a single, cohesive paragraph—a rich and executable prompt ready for the Veo model.
*   **Self-Correction Checklist:** Before finalizing, quickly check your work:
    *   **Anchoring:** Have I repeated the core visual elements from the image/prompt?
    *   **Specificity:** Is 'a bug' described as 'a seven-spotted ladybug with glistening elytra'?
    *   **Cinematography:** Does the prompt combine shot type, movement, and lens effect?
    *   **Cohesion:** Do all the details (lighting, action, style) serve a single, focused scene?
*   **Safety:** Ensure the prompt adheres to responsible AI guidelines, avoiding the generation of harmful or prohibited content.`;

  /**
   * Enhances a basic prompt using Google's 4-step cinematic method
   */
  async enhancePrompt(options: CinematicPromptOptions): Promise<CinematicPromptResult> {
    const techniques: string[] = [];
    let enhancedPrompt = options.basePrompt;
    let qualityScore = 5.0; // Base score

    // Step 1: Anchor visual elements
    if (options.referenceImage) {
      enhancedPrompt = this.applyImageFidelity(enhancedPrompt, options.referenceImage);
      techniques.push('Image Fidelity Anchoring');
      qualityScore += 1.5;
    }

    if (options.characterDescription) {
      enhancedPrompt = this.applyCharacterPreservation(enhancedPrompt, options.characterDescription);
      techniques.push('Character Consistency');
      qualityScore += 1.0;
    }

    // Step 2: Build the world
    enhancedPrompt = this.enrichSceneDetails(enhancedPrompt, options);
    techniques.push('Cinematic Scene Enrichment');
    qualityScore += 1.0;

    // Step 3: Direct the camera
    enhancedPrompt = this.addCinematography(enhancedPrompt, options.cameraStyle);
    techniques.push('Professional Cinematography');
    qualityScore += 1.5;

    // Step 4: Add mood and style
    if (options.desiredMood) {
      enhancedPrompt = this.applyMoodAndStyle(enhancedPrompt, options.desiredMood);
      techniques.push('Mood & Style Direction');
      qualityScore += 1.0;
    }

    return {
      enhancedPrompt,
      appliedTechniques: techniques,
      qualityScore: Math.min(qualityScore, 10.0)
    };
  }

  /**
   * Step 1: Apply Image Fidelity - Anchor core visual elements
   */
  private applyImageFidelity(prompt: string, referenceImage: { description: string; keyElements: string[] }): string {
    const anchors = referenceImage.keyElements.join(', ');
    return `${prompt}. PRESERVE: ${referenceImage.description}. Key visual anchors: ${anchors}. Maintain exact visual elements: ${anchors}.`;
  }

  /**
   * Apply Character Preservation
   */
  private applyCharacterPreservation(prompt: string, characterDescription: string): string {
    return `${prompt}. CHARACTER: ${characterDescription}. CRITICAL: Preserve exact facial features, expressions, and identity markers throughout the video. The character's appearance must remain perfectly consistent.`;
  }

  /**
   * Step 2: Enrich Scene Details - Build the world
   */
  private enrichSceneDetails(prompt: string, options: CinematicPromptOptions): string {
    const enrichments: string[] = [];

    // Add environmental interactions
    enrichments.push('subtle environmental motion (wisps of movement, natural breathing, authentic micro-expressions)');

    // Add texture and detail
    enrichments.push('visible skin texture with natural pores, authentic human imperfections');

    // Add atmosphere
    if (options.sceneContext) {
      enrichments.push(`scene context: ${options.sceneContext}`);
    }

    // Add sensory details
    enrichments.push('natural lighting with proper shadows and reflections, volumetric atmosphere');

    return `${prompt}. ENVIRONMENT: ${enrichments.join(', ')}.`;
  }

  /**
   * Step 3: Add Cinematography - Direct the camera
   */
  private addCinematography(prompt: string, cameraStyle?: string): string {
    const defaultStyle = 'professional eye-level shot with smooth camera movement, shallow depth of field with cinematic bokeh, 50mm lens, photorealistic 8K quality';
    const style = cameraStyle || defaultStyle;

    return `${prompt}. CINEMATOGRAPHY: ${style}. Professional camera work with natural movement physics and realistic spatial awareness.`;
  }

  /**
   * Step 4: Apply Mood and Style
   */
  private applyMoodAndStyle(prompt: string, mood: string): string {
    return `${prompt}. MOOD & STYLE: ${mood}. Overall aesthetic maintains consistent emotional tone and visual coherence throughout the entire video.`;
  }

  /**
   * Generate the master prompt for Gemini to use
   * This returns Google's official template
   */
  static getMasterPromptTemplate(): string {
    return VEO3CinematicPromptEngineer.MASTER_TEMPLATE;
  }
}

/**
 * Factory function to create enhanced prompts
 */
export function createCinematicPrompt(options: CinematicPromptOptions): Promise<CinematicPromptResult> {
  const engineer = new VEO3CinematicPromptEngineer();
  return engineer.enhancePrompt(options);
}
