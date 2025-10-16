/**
 * Sequential Prompt Generator Service
 *
 * Uses Gemini Flash to intelligently split a master prompt into N segment-specific prompts
 * that follow SEQUENTIAL_EXTEND_PROMPTING_GUIDE.md patterns for seamless 8-second video extensions.
 *
 * Key Responsibilities:
 * - Split master prompt into segment-appropriate content chunks
 * - Add proper CONTINUE, PACING, BODY LANGUAGE, TRANSITION instructions
 * - Ensure natural pauses at 8-second boundaries
 * - Maintain character consistency across all segments
 */

import { GoogleGenAI } from '@google/genai';

// LLM Provider Types - Support for ANY text generation model
// This service generates TEXT PROMPTS for video models (VEO3, Sora 2, Runway, etc.)
type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'meta' | 'mistral' | 'xai';

interface LLMConfig {
  provider: LLMProvider;
  model: string;           // Examples (Jan 2025):
                           // - Gemini: 'gemini-2.5-flash', 'gemini-2.5-pro'
                           // - OpenAI: 'gpt-5', 'o3', 'gpt-4.5'
                           // - Anthropic: 'claude-4'
                           // - DeepSeek: 'deepseek-llm'
                           // - Meta: 'llama-3'
                           // - Mistral: 'mistral-next'
                           // - xAI: 'grok-1.5'
  apiKey?: string;         // Optional - falls back to env vars (GEMINI_API_KEY, OPENAI_API_KEY, etc.)
}

interface SegmentPrompt {
  segmentNumber: number; // 1-indexed (segment 1 is first extension after original)
  content: string;       // What to cover in this segment
  prompt: string;        // Full VEO3-ready prompt with all instructions
  duration: number;      // Expected duration (e.g., 8 seconds)
}

interface GeneratePromptsRequest {
  masterPrompt: string;       // User's high-level description of what should happen
  numberOfSegments: number;   // How many extension segments to generate (e.g., 7 for 64s total)
  segmentDuration: number;    // Duration of each segment in seconds (e.g., 8)
  contentType?: 'explanatory' | 'storytelling' | 'demonstration' | 'sales'; // Default: explanatory
  characterDescription?: string; // Optional: Describe the character for consistency
  llmConfig?: LLMConfig;      // LLM configuration (provider + model). Default: Gemini Flash
}

interface GeneratePromptsResponse {
  success: boolean;
  segmentPrompts: SegmentPrompt[];
  totalDuration: number;
  error?: string;
}

export class SequentialPromptGenerator {
  private geminiClient: GoogleGenAI | null = null;
  // TODO: Add OpenAI, Anthropic, etc. clients as needed
  // private openaiClient: OpenAI | null = null;
  // private anthropicClient: Anthropic | null = null;

  private getGeminiClient(): GoogleGenAI {
    if (!this.geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      this.geminiClient = new GoogleGenAI({ apiKey });
    }
    return this.geminiClient;
  }

  /**
   * Generate text using the specified LLM provider
   * Currently supports: Gemini
   * TODO: Add OpenAI, Anthropic, DeepSeek, Meta Llama, Mistral, xAI when needed
   */
  private async generateText(prompt: string, config: LLMConfig): Promise<string> {
    switch (config.provider) {
      case 'gemini': {
        const client = this.getGeminiClient();
        const response = await client.models.generateContent({
          model: config.model,
          contents: prompt
        });
        return response.text;
      }

      case 'openai':
        // TODO: Implement OpenAI GPT-5, o3, gpt-4.5
        throw new Error('OpenAI provider not yet implemented. Use provider: "gemini" for now.');

      case 'anthropic':
        // TODO: Implement Anthropic Claude 4
        throw new Error('Anthropic provider not yet implemented. Use provider: "gemini" for now.');

      case 'deepseek':
      case 'meta':
      case 'mistral':
      case 'xai':
        throw new Error(`${config.provider} provider not yet implemented. Use provider: "gemini" for now.`);

      default:
        throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
  }

  /**
   * Generate segment-specific prompts from a master prompt
   */
  async generateSegmentPrompts(request: GeneratePromptsRequest): Promise<GeneratePromptsResponse> {
    try {
      const {
        masterPrompt,
        numberOfSegments,
        segmentDuration,
        contentType = 'explanatory',
        characterDescription = 'Professional presenter',
        llmConfig = { provider: 'gemini', model: 'gemini-2.0-flash-exp' } // Default to Gemini Flash for speed
      } = request;

      // Build the meta-prompt for Gemini
      const metaPrompt = this.buildMetaPrompt({
        masterPrompt,
        numberOfSegments,
        segmentDuration,
        contentType,
        characterDescription
      });

      // Call LLM to generate segment prompts (modular - supports Gemini, OpenAI, Claude, etc.)
      const text = await this.generateText(metaPrompt, llmConfig);

      // Parse the JSON response
      const segmentPrompts = this.parseSegmentPrompts(text, numberOfSegments, segmentDuration);

      return {
        success: true,
        segmentPrompts,
        totalDuration: numberOfSegments * segmentDuration
      };
    } catch (error: any) {
      console.error('Error generating segment prompts:', error);
      return {
        success: false,
        segmentPrompts: [],
        totalDuration: 0,
        error: error.message
      };
    }
  }

  /**
   * Build the meta-prompt that instructs Gemini how to split the master prompt
   */
  private buildMetaPrompt(params: {
    masterPrompt: string;
    numberOfSegments: number;
    segmentDuration: number;
    contentType: string;
    characterDescription: string;
  }): string {
    const { masterPrompt, numberOfSegments, segmentDuration, contentType, characterDescription } = params;

    return `You are an expert video prompting specialist. Your task is to split a master prompt into ${numberOfSegments} segment-specific prompts for seamless video extensions.

**MASTER PROMPT**: "${masterPrompt}"

**CONSTRAINTS**:
- Each segment is EXACTLY ${segmentDuration} seconds
- Content type: ${contentType}
- Character: ${characterDescription}
- Segments will be stitched with minimal transitions (0.3s fade)
- CRITICAL: Dialogue MUST end at natural pauses so transitions are invisible

**YOUR TASK**: Generate ${numberOfSegments} segment-specific prompts following this EXACT structure:

**WINNING FORMULA FOR EACH SEGMENT**:
[CONTINUATION INSTRUCTION] + [SPECIFIC CONTENT CHUNK] + [PACING GUIDANCE] + [BODY LANGUAGE HINT] + [TRANSITION PREPARATION]

**REQUIRED ELEMENTS IN EACH PROMPT**:

1. **CONTINUATION INSTRUCTION** (CRITICAL for segments 2+):
   - Segment 1: "BEGIN: [Character] starts in [setting]"
   - Segments 2+: "CONTINUE from previous: Maintain same [setting], [positioning], [energy]"

2. **SPECIFIC CONTENT CHUNK**:
   - Break master prompt into ${numberOfSegments} logical pieces
   - Each segment should cover ONE clear point/benefit/story beat
   - Example: "Explain instant quote feature" NOT "Explain all features"

3. **PACING GUIDANCE** (ESSENTIAL for seamless transitions):
   - For ${segmentDuration}s segments: "Speak in 2-3 short sentences with 1-second pauses between"
   - ALWAYS include: "End segment at natural thought completion"
   - Example: "PACING: Three sentences - 'QuoteMoto compares quotes.' [pause] 'From over 50 insurers.' [pause] 'All in 60 seconds.'"

4. **BODY LANGUAGE HINT**:
   - Minimal movement during transitions
   - Return to neutral position before segment ends
   - Example: "BODY LANGUAGE: Subtle hand gesture on key point, then return to neutral position"

5. **TRANSITION PREPARATION**:
   - Guide for smooth handoff to next segment
   - Example: "TRANSITION: Confident nod and brief hold before next point"

**CONTENT TYPE-SPECIFIC PATTERNS**:

${this.getContentTypeGuidance(contentType)}

**OUTPUT FORMAT** (JSON Array):
\`\`\`json
[
  {
    "segmentNumber": 1,
    "content": "Brief description of what this segment covers",
    "prompt": "Full VEO3-ready prompt with all required elements",
    "duration": ${segmentDuration}
  },
  ...
]
\`\`\`

**CRITICAL RULES**:
1. ✅ Each prompt MUST include all 5 required elements
2. ✅ Pacing instructions MUST ensure ${segmentDuration-1}-${segmentDuration-0.5}s of content with natural ending pause
3. ✅ Content MUST be chunked so each segment feels complete but flows to next
4. ✅ Segments 2+ MUST start with "CONTINUE from previous"
5. ✅ NO mid-sentence cutoffs - always end at natural pauses
6. ✅ Maintain consistent character energy/positioning across all segments

Generate the ${numberOfSegments} segment prompts now as a JSON array:`;
  }

  /**
   * Get content type-specific guidance
   */
  private getContentTypeGuidance(contentType: string): string {
    const guidance: Record<string, string> = {
      explanatory: `
**EXPLANATORY CONTENT PATTERN**:
- Break explanation into clear steps/points
- Each segment covers ONE concept completely
- Use phrases like "First...", "Next...", "Finally..."
- Pacing: 2-3 sentence chunks with pauses for comprehension
- Example: "CONTENT: Explain instant quote feature - how to enter zip code and get results"
`,
      storytelling: `
**STORYTELLING CONTENT PATTERN**:
- Progress narrative by one story beat per segment
- Include emotional transitions (concern → hope → satisfaction)
- Natural storytelling rhythm with dramatic pauses
- Example: "NARRATIVE: Jane discovers she's overpaying, feels frustrated, then relief when finding solution"
`,
      demonstration: `
**DEMONSTRATION CONTENT PATTERN**:
- Show one action/step per segment
- Include visual holds on key moments (2-3 seconds)
- Narrate what viewer is seeing
- Example: "ACTION: Point to screen showing savings comparison, hold for 3 seconds"
`,
      sales: `
**SALES/MARKETING CONTENT PATTERN**:
- Each segment highlights one benefit/feature
- Maintain consistent enthusiasm (7/10 energy)
- Clear, confident delivery with natural emphasis
- Example: "CONTENT: Emphasize savings - 'Most drivers save $500 per year. That's real money back.'"
`
    };

    return guidance[contentType] || guidance.explanatory;
  }

  /**
   * Parse LLM's JSON response into SegmentPrompt objects
   */
  private parseSegmentPrompts(text: string, numberOfSegments: number, segmentDuration: number): SegmentPrompt[] {
    // Extract JSON from response (handle markdown code blocks and various formats)
    let jsonText = text;

    // Try extracting from markdown code block first
    const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      // Try finding JSON array directly
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonText = arrayMatch[0];
      }
    }

    // Clean up common JSON issues
    jsonText = jsonText
      .replace(/,\s*}/g, '}')  // Remove trailing commas before }
      .replace(/,\s*]/g, ']'); // Remove trailing commas before ]

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse JSON. Raw response:', text.substring(0, 500));
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }

    // Validate and normalize
    if (!Array.isArray(parsed)) {
      throw new Error('Expected JSON array of segment prompts');
    }

    if (parsed.length !== numberOfSegments) {
      console.warn(`Expected ${numberOfSegments} segments, got ${parsed.length}. Using what was generated.`);
    }

    return parsed.map((item: any, index: number) => ({
      segmentNumber: item.segmentNumber || index + 1,
      content: item.content || `Segment ${index + 1} content`,
      prompt: item.prompt || '',
      duration: item.duration || segmentDuration
    }));
  }

  /**
   * Get a single prompt for a specific segment (useful for advanced mode pre-population)
   */
  async generateSingleSegmentPrompt(params: {
    segmentNumber: number;
    masterPrompt: string;
    totalSegments: number;
    segmentDuration: number;
    contentType?: string;
    characterDescription?: string;
  }): Promise<string> {
    const result = await this.generateSegmentPrompts({
      masterPrompt: params.masterPrompt,
      numberOfSegments: params.totalSegments,
      segmentDuration: params.segmentDuration,
      contentType: params.contentType as any,
      characterDescription: params.characterDescription
    });

    if (!result.success || result.segmentPrompts.length === 0) {
      throw new Error('Failed to generate segment prompts');
    }

    const segment = result.segmentPrompts.find(s => s.segmentNumber === params.segmentNumber);
    if (!segment) {
      throw new Error(`Segment ${params.segmentNumber} not found`);
    }

    return segment.prompt;
  }

  /**
   * Generate Sora 2 sequential extend prompts with "Context + Prompt" structure
   * Based on mshumer/sora-extend technique for continuity
   *
   * This format includes:
   * 1. Context section (background info for AI, not visible in video)
   * 2. Prompt section (actual generation instructions with explicit continuity)
   */
  async generateSora2SequentialPrompts(request: GeneratePromptsRequest): Promise<GeneratePromptsResponse> {
    try {
      const {
        masterPrompt,
        numberOfSegments,
        segmentDuration,
        contentType = 'explanatory',
        characterDescription = 'Professional presenter',
        llmConfig = { provider: 'gemini', model: 'gemini-2.0-flash-exp' }
      } = request;

      // Build meta-prompt for Sora 2 format
      const metaPrompt = this.buildSora2MetaPrompt({
        masterPrompt,
        numberOfSegments,
        segmentDuration,
        contentType,
        characterDescription
      });

      // Generate prompts with context structure
      const text = await this.generateText(metaPrompt, llmConfig);

      // Parse Sora 2-style prompts
      const segmentPrompts = this.parseSegmentPrompts(text, numberOfSegments, segmentDuration);

      return {
        success: true,
        segmentPrompts,
        totalDuration: numberOfSegments * segmentDuration
      };
    } catch (error: any) {
      console.error('Error generating Sora 2 segment prompts:', error);
      return {
        success: false,
        segmentPrompts: [],
        totalDuration: 0,
        error: error.message
      };
    }
  }

  /**
   * Build meta-prompt for Sora 2's "Context + Prompt" structure
   * Based on sora-extend technique from mshumer
   */
  private buildSora2MetaPrompt(params: {
    masterPrompt: string;
    numberOfSegments: number;
    segmentDuration: number;
    contentType: string;
    characterDescription: string;
  }): string {
    const { masterPrompt, numberOfSegments, segmentDuration, contentType, characterDescription } = params;

    return `You are a Sora 2 video prompt specialist creating sequential extended videos using the proven sora-extend technique.

**MASTER PROMPT**: "${masterPrompt}"

**CONSTRAINTS**:
- Each segment is EXACTLY ${segmentDuration} seconds (Sora 2 supports: 4s, 8s, 12s, 16s, 20s)
- Content type: ${contentType}
- Character: ${characterDescription}
- Final frame of each segment becomes input_reference for next segment (automatic continuity)

**SORA 2 SEQUENTIAL EXTEND FORMAT**:

For **Segment 1** (Fresh Start):
\`\`\`
First shot introducing [subject/scene]. [Detailed description of opening]. Showcases [key elements]. The style is [aesthetic description], appropriate for [context].
\`\`\`

For **Segments 2+** (With Context):
\`\`\`
Context (not visible in video, only for AI guidance):
* You are creating segment [N] of ${numberOfSegments} for [overall concept].
* The previous ${segmentDuration}-second scene ended with [specific final frame description].
* Maintain continuity of [character/setting/lighting/style].

Prompt: [N]th shot begins exactly from the final frame of the previous scene, showing [what's visible at start]. Now, [specific action/transition]. Focus specifically on [current segment content]. Maintain consistent [style/mood/aesthetic] matching the [previous description] theme.
\`\`\`

**CRITICAL RULES FOR CONTINUITY**:
1. ✅ Segment 1: Establish scene, character, style clearly
2. ✅ Segments 2+: MUST reference previous segment's ending state
3. ✅ Each prompt MUST say "begins exactly from the final frame of the previous scene"
4. ✅ Describe what's visible at segment start (continuity checkpoint)
5. ✅ Then describe NEW action/content for this segment
6. ✅ Context section provides background (helps AI understand sequence)
7. ✅ Maintain visual style, lighting, and character consistency
8. ✅ Each segment should feel like natural continuation, not a jump cut

**CONTENT CHUNKING FOR ${segmentDuration}s SEGMENTS**:
${this.getSora2ContentChunkingGuidance(segmentDuration, contentType)}

**OUTPUT FORMAT** (JSON Array):
\`\`\`json
[
  {
    "segmentNumber": 1,
    "content": "Opening: Introduce [subject] and establish [setting/style]",
    "prompt": "First shot introducing... [full Sora 2 prompt without context section]",
    "duration": ${segmentDuration}
  },
  {
    "segmentNumber": 2,
    "content": "Continue: [specific content chunk]",
    "prompt": "Context (not visible in video, only for AI guidance):\\n* You are creating segment 2...\\n\\nPrompt: Second shot begins exactly from the final frame...",
    "duration": ${segmentDuration}
  },
  ...
]
\`\`\`

**EXAMPLE (8-Second iPhone Intro)**:

Segment 1:
{
  "prompt": "First shot introducing the new iPhone 19. Initially, the screen is completely dark. The phone, positioned vertically and facing directly forward, emerges slowly and dramatically out of darkness, gradually illuminated from the center of the screen outward, showcasing a vibrant, colorful, dynamic wallpaper on its edge-to-edge glass display. The style is futuristic, sleek, and premium, appropriate for an official Apple product reveal."
}

Segment 2:
{
  "prompt": "Context (not visible in video, only for AI guidance):\\n* You are creating the second part of an official intro video for Apple's new iPhone 19.\\n* The previous ${segmentDuration}-second scene ended with the phone facing directly forward, clearly displaying its vibrant front screen and colorful wallpaper.\\n\\nPrompt: Second shot begins exactly from the final frame of the previous scene, showing the front of the iPhone 19 with its vibrant, colorful display clearly visible. Now, smoothly rotate the phone horizontally, turning it from the front to reveal the back side. Focus specifically on the advanced triple-lens camera module, clearly highlighting its premium materials, reflective metallic surfaces, and detailed lenses. Maintain consistent dramatic lighting, sleek visual style, and luxurious feel matching the official Apple product introduction theme."
}

Generate ${numberOfSegments} Sora 2-optimized prompts now with proper context structure:`;
  }

  /**
   * Get content chunking guidance specific to Sora 2 segment duration
   */
  private getSora2ContentChunkingGuidance(segmentDuration: number, contentType: string): string {
    const durationGuidance: Record<number, string> = {
      4: `
**4-Second Segments** (Quick Cuts):
- ONE action/point per segment
- Fast pacing, dynamic movement
- Example: "Show product → Rotate 180° → Hold final angle"`,
      8: `
**8-Second Segments** (Balanced):
- ONE complete thought/action per segment
- Moderate pacing with clear beginning/end
- Example: "Introduce feature → Demonstrate benefit → Return to neutral"`,
      12: `
**12-Second Segments** (Standard):
- TWO related actions per segment
- Natural pacing with breathing room
- Example: "Present problem → Show solution → Highlight key benefit"`,
      16: `
**16-Second Segments** (Extended):
- THREE story beats per segment
- Comfortable pacing, detailed demonstration
- Example: "Setup context → Main action → Secondary detail → Conclusion"`,
      20: `
**20-Second Segments** (Long-Form):
- FULL mini-story per segment
- Relaxed pacing with multiple beats
- Example: "Introduction → Build tension → Resolution → Call-to-action"`
    };

    return durationGuidance[segmentDuration] || durationGuidance[12];
  }
}

// Export singleton instance
export const sequentialPromptGenerator = new SequentialPromptGenerator();
