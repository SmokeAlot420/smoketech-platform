/**
 * Gemini-Powered Prompt Enhancement Service
 * Uses Google's Gemini to automatically enhance prompts for better VEO3 quality
 *
 * Based on patterns from vertex-ai-creative-studio/config/rewriters.py
 */

import { GoogleGenAI } from '@google/genai';
import { VEO3CinematicPromptEngineer } from '../enhancement/veo3CinematicPromptEngineer';

export interface PromptEnhancementRequest {
  basePrompt: string;
  referenceImageDescription?: string;
  characterDescription?: string;
  enhancementLevel?: 'basic' | 'standard' | 'cinematic';
  preserveIntent?: boolean;
}

export interface PromptEnhancementResult {
  originalPrompt: string;
  enhancedPrompt: string;
  enhancementMethod: string;
  qualityImprovement: number;
  generationTime: number;
}

export class GeminiPromptEnhancer {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.client = new GoogleGenAI({
      apiKey
    });

    console.log('🤖 Gemini Prompt Enhancer initialized');
  }

  /**
   * Enhance a prompt using Gemini with Google's master prompt template
   */
  async enhancePrompt(request: PromptEnhancementRequest): Promise<PromptEnhancementResult> {
    const startTime = Date.now();

    console.log('🎨 Enhancing prompt with Gemini...');
    console.log(`Original: "${request.basePrompt.substring(0, 100)}..."`);

    try {
      let enhancedPrompt: string;
      let enhancementMethod: string;
      let qualityImprovement: number;

      switch (request.enhancementLevel) {
        case 'cinematic':
          // Use Google's full master template
          ({ enhancedPrompt, enhancementMethod, qualityImprovement } =
            await this.applyCinematicEnhancement(request));
          break;

        case 'standard':
          // Use rewriter-style enhancement
          ({ enhancedPrompt, enhancementMethod, qualityImprovement } =
            await this.applyStandardEnhancement(request));
          break;

        case 'basic':
        default:
          // Quick enhancement focusing on key elements
          ({ enhancedPrompt, enhancementMethod, qualityImprovement } =
            await this.applyBasicEnhancement(request));
          break;
      }

      const generationTime = Date.now() - startTime;

      console.log(`✅ Enhanced in ${generationTime}ms`);
      console.log(`Enhanced: "${enhancedPrompt.substring(0, 100)}..."`);

      return {
        originalPrompt: request.basePrompt,
        enhancedPrompt,
        enhancementMethod,
        qualityImprovement,
        generationTime
      };

    } catch (error) {
      console.error('❌ Prompt enhancement failed:', error);

      // Fallback to original prompt if enhancement fails
      return {
        originalPrompt: request.basePrompt,
        enhancedPrompt: request.basePrompt,
        enhancementMethod: 'none (fallback)',
        qualityImprovement: 0,
        generationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Cinematic Enhancement - Full Google Master Template
   */
  private async applyCinematicEnhancement(
    request: PromptEnhancementRequest
  ): Promise<{ enhancedPrompt: string; enhancementMethod: string; qualityImprovement: number }> {

    const masterTemplate = VEO3CinematicPromptEngineer.getMasterPromptTemplate();

    // Build context for Gemini
    let contextualInfo = '';
    if (request.referenceImageDescription) {
      contextualInfo += `\n\nREFERENCE IMAGE DESCRIPTION: ${request.referenceImageDescription}`;
    }
    if (request.characterDescription) {
      contextualInfo += `\n\nCHARACTER TO PRESERVE: ${request.characterDescription}`;
    }

    const userPrompt = `${masterTemplate}\n\nNow apply this process to transform the following user prompt:\n\n"${request.basePrompt}"${contextualInfo}\n\nProvide only the final enhanced prompt, nothing else.`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: userPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });

    const enhancedPrompt = this.extractTextFromResponse(response);

    return {
      enhancedPrompt,
      enhancementMethod: 'cinematic (Google Master Template)',
      qualityImprovement: 8.5
    };
  }

  /**
   * Standard Enhancement - Rewriter Style
   */
  private async applyStandardEnhancement(
    request: PromptEnhancementRequest
  ): Promise<{ enhancedPrompt: string; enhancementMethod: string; qualityImprovement: number }> {

    const rewriterPrompt = `You are an expert prompt engineer for video generation. Rewrite the following prompt to be more descriptive and cinematic, following professional filmmaking language.

Original prompt: "${request.basePrompt}"

Examples of enhanced prompts:
- "A close-up tracking shot of a sleek Siamese cat perched regally, bathed in warm golden hour light, with a deep purple background creating cinematic depth, shot with shallow depth of field and creamy bokeh."
- "Drone view of waves crashing against rugged cliffs along Big Sur's coastline, the crashing blue waters creating white-tipped waves, golden sunset light illuminating the rocky shore, dramatic aerial cinematography capturing the raw beauty of the Pacific Coast."

${request.characterDescription ? `IMPORTANT: Preserve this character: ${request.characterDescription}` : ''}
${request.referenceImageDescription ? `Visual reference: ${request.referenceImageDescription}` : ''}

Provide only the enhanced prompt, nothing else.`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: rewriterPrompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 512
      }
    });

    const enhancedPrompt = this.extractTextFromResponse(response);

    return {
      enhancedPrompt,
      enhancementMethod: 'standard (Rewriter)',
      qualityImprovement: 6.0
    };
  }

  /**
   * Basic Enhancement - Quick improvements
   */
  private async applyBasicEnhancement(
    request: PromptEnhancementRequest
  ): Promise<{ enhancedPrompt: string; enhancementMethod: string; qualityImprovement: number }> {

    const basicPrompt = `Add cinematic details to this video prompt, keeping it concise:

"${request.basePrompt}"

Add:
1. Camera shot type (close-up, wide shot, etc.)
2. One lighting detail
3. One quality descriptor (photorealistic, 8K, etc.)

${request.characterDescription ? `Preserve character: ${request.characterDescription}` : ''}

Provide only the enhanced prompt, nothing else.`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: basicPrompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 256
      }
    });

    const enhancedPrompt = this.extractTextFromResponse(response);

    return {
      enhancedPrompt,
      enhancementMethod: 'basic (Quick Enhancement)',
      qualityImprovement: 3.5
    };
  }

  /**
   * Extract text from Gemini response
   */
  private extractTextFromResponse(response: any): string {
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            return part.text.trim();
          }
        }
      }
    }

    throw new Error('No text content in Gemini response');
  }

  /**
   * Batch enhance multiple prompts
   */
  async batchEnhance(prompts: string[], level: 'basic' | 'standard' | 'cinematic' = 'standard'): Promise<PromptEnhancementResult[]> {
    console.log(`🚀 Batch enhancing ${prompts.length} prompts...`);

    const results: PromptEnhancementResult[] = [];

    for (const prompt of prompts) {
      const result = await this.enhancePrompt({
        basePrompt: prompt,
        enhancementLevel: level
      });
      results.push(result);
    }

    console.log(`✅ Batch enhancement completed: ${results.length} prompts enhanced`);
    return results;
  }
}

// Factory functions
export function createGeminiPromptEnhancer(): GeminiPromptEnhancer {
  return new GeminiPromptEnhancer();
}

let _enhancerInstance: GeminiPromptEnhancer | null = null;
export function getGeminiPromptEnhancer(): GeminiPromptEnhancer {
  if (!_enhancerInstance) {
    _enhancerInstance = new GeminiPromptEnhancer();
  }
  return _enhancerInstance;
}
