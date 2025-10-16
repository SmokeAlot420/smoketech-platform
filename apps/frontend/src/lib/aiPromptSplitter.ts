/**
 * AI Prompt Splitter
 * Intelligently splits a master prompt into sequential video segments with proper flow and transitions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface SegmentPrompt {
  segmentNumber: number;
  prompt: string;
  duration: number;
  transition: string;
}

interface SplitPromptResult {
  success: boolean;
  segments: SegmentPrompt[];
  error?: string;
}

export class AIPromptSplitter {
  private client: GoogleGenerativeAI;
  private model: string = 'gemini-2.5-flash';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is required for AI prompt splitting');
    }
    this.client = new GoogleGenerativeAI(key);
  }

  /**
   * Split master prompt into sequential segments
   */
  async splitPrompt(
    masterPrompt: string,
    numberOfSegments: number,
    segmentDuration: number = 8
  ): Promise<SplitPromptResult> {
    try {
      const systemPrompt = `You are an expert video scriptwriter specializing in creating sequential, engaging video segments.

Your task: Split the master prompt into ${numberOfSegments} sequential segments, each ${segmentDuration} seconds long.

CRITICAL REQUIREMENTS:
1. Each segment must tell PART of the story, not repeat the whole thing
2. Segments must flow naturally from one to the next
3. Each segment should be dialogue/narration that fits in ${segmentDuration} seconds
4. Include smooth transitions between segments
5. Maintain the core message and brand voice
6. Each segment must be DIFFERENT and SEQUENTIAL

SEGMENT STRUCTURE:
- Segment 1: Hook/Introduction
- Middle segments: Key points, benefits, details (one per segment)
- Final segment: Call-to-action or conclusion

OUTPUT FORMAT (JSON):
{
  "segments": [
    {
      "segmentNumber": 1,
      "prompt": "Professional insurance advisor: 'Hello, thank you for calling QuoteMoto Insurance'",
      "duration": ${segmentDuration},
      "transition": "smooth_continue"
    },
    ...
  ]
}

MASTER PROMPT TO SPLIT:
${masterPrompt}

NUMBER OF SEGMENTS: ${numberOfSegments}
DURATION PER SEGMENT: ${segmentDuration} seconds

Split this into ${numberOfSegments} sequential segments that tell a complete story. Each segment must be DIFFERENT and continue the narrative.`;

      const model = this.client.getGenerativeModel({ model: this.model });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      });

      const response = result.response;
      let text = response.text().trim();

      // Strip markdown code blocks if present (Gemini sometimes wraps JSON in markdown)
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,  '').trim();
      }

      // Parse JSON response
      const parsed = JSON.parse(text);

      if (!parsed.segments || !Array.isArray(parsed.segments)) {
        throw new Error('Invalid response format from AI');
      }

      // Validate segments
      if (parsed.segments.length !== numberOfSegments) {
        console.warn(`Expected ${numberOfSegments} segments, got ${parsed.segments.length}`);
      }

      return {
        success: true,
        segments: parsed.segments.map((seg: any, idx: number) => ({
          segmentNumber: idx + 1,
          prompt: seg.prompt || seg.content || seg.text,
          duration: segmentDuration,
          transition: seg.transition || 'smooth_continue'
        }))
      };

    } catch (error) {
      console.error('Error splitting prompt with AI:', error);
      return {
        success: false,
        segments: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fallback: Simple manual split if AI fails
   */
  fallbackSplit(
    masterPrompt: string,
    numberOfSegments: number,
    segmentDuration: number = 8
  ): SegmentPrompt[] {
    // Simple approach: try to split by sentences or natural breaks
    const sentences = masterPrompt.match(/[^.!?]+[.!?]+/g) || [masterPrompt];
    const segments: SegmentPrompt[] = [];

    if (sentences.length >= numberOfSegments) {
      // Distribute sentences across segments
      const sentencesPerSegment = Math.ceil(sentences.length / numberOfSegments);

      for (let i = 0; i < numberOfSegments; i++) {
        const start = i * sentencesPerSegment;
        const end = Math.min(start + sentencesPerSegment, sentences.length);
        const segmentText = sentences.slice(start, end).join(' ');

        segments.push({
          segmentNumber: i + 1,
          prompt: `Professional insurance advisor continuing: "${segmentText}"`,
          duration: segmentDuration,
          transition: i === 0 ? 'intro' : i === numberOfSegments - 1 ? 'outro' : 'smooth_continue'
        });
      }
    } else {
      // Fewer sentences than segments, repeat with variations
      for (let i = 0; i < numberOfSegments; i++) {
        const sentence = sentences[i % sentences.length];
        segments.push({
          segmentNumber: i + 1,
          prompt: `Professional insurance advisor (part ${i + 1}/${numberOfSegments}): "${sentence}"`,
          duration: segmentDuration,
          transition: 'smooth_continue'
        });
      }
    }

    return segments;
  }
}

/**
 * Singleton instance
 */
let splitterInstance: AIPromptSplitter | null = null;

export function getAIPromptSplitter(): AIPromptSplitter {
  if (!splitterInstance) {
    splitterInstance = new AIPromptSplitter();
  }
  return splitterInstance;
}
