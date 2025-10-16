/**
 * Generate Workflow API Endpoint
 *
 * POST /api/generate-workflow
 *
 * Executes video generation templates with real-time progress streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { SingleVideoTemplate } from '@/lib/templates/SingleVideoTemplate';
import { SeriesVideoTemplate } from '@/lib/templates/SeriesVideoTemplate';
import { NoHumanInterfaceTemplate } from '@/lib/templates/NoHumanInterfaceTemplate';
import { AssetAnimationTemplate, AssetVideoConfig } from '@/lib/templates/AssetAnimationTemplate';
import { VideoConfig, VideoResult } from '@/lib/templates/BaseVideoTemplate';
import { promises as fs } from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════
// REQUEST TYPES
// ═══════════════════════════════════════════════════════════════════════

interface GenerateWorkflowRequest {
  templateType: 'single' | 'series' | 'no-human' | 'asset-animation';
  config: VideoConfig;
  assetConfig?: {
    assetPrompt: string;
    assetType: string;
    temperature?: number;
  };
  apiKey?: string; // Optional: for GEMINI_API_KEY override
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body: GenerateWorkflowRequest = await request.json();

    console.log('🎬 Generate Workflow API - Starting');
    console.log(`📋 Template Type: ${body.templateType}`);
    console.log(`📊 Scenarios: ${body.config.scenarios.length}`);

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Set API key if provided
    if (body.apiKey) {
      process.env.GEMINI_API_KEY = body.apiKey;
    }

    // Select and execute template
    let result: VideoResult;

    switch (body.templateType) {
      case 'single':
        const singleTemplate = new SingleVideoTemplate();
        result = await singleTemplate.generateVideo(body.config);
        break;

      case 'series':
        const seriesTemplate = new SeriesVideoTemplate();
        result = await seriesTemplate.generateVideo(body.config);
        break;

      case 'no-human':
        const noHumanTemplate = new NoHumanInterfaceTemplate();
        result = await noHumanTemplate.generateVideo(body.config);
        break;

      case 'asset-animation':
        if (!body.assetConfig) {
          return NextResponse.json(
            { success: false, error: 'assetConfig required for asset-animation template' },
            { status: 400 }
          );
        }

        const assetTemplate = new AssetAnimationTemplate();
        const assetVideoConfig: AssetVideoConfig = {
          ...body.config,
          asset: body.assetConfig
        };
        result = await assetTemplate.generateVideo(assetVideoConfig);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown template type: ${body.templateType}` },
          { status: 400 }
        );
    }

    // Copy videos to public directory if successful
    if (result.success && result.videos && result.videos.length > 0) {
      try {
        const publicDir = path.join(process.cwd(), 'public', 'workflow-videos');
        await fs.mkdir(publicDir, { recursive: true });

        const copiedVideos = await Promise.all(
          result.videos.map(async (video) => {
            try {
              const sourcePath = video.path;
              const filename = path.basename(sourcePath);
              const destPath = path.join(publicDir, filename);

              // Copy the video file
              await fs.copyFile(sourcePath, destPath);

              console.log(`📹 Copied video: ${filename} → /workflow-videos/${filename}`);

              // Return video with public URL
              return {
                ...video,
                url: `/workflow-videos/${filename}`,
                path: destPath
              };
            } catch (error) {
              console.error(`❌ Failed to copy video ${video.path}:`, error);
              // Return original video if copy fails
              return video;
            }
          })
        );

        // Update result with public URLs
        result.videos = copiedVideos;
      } catch (error) {
        console.error('❌ Failed to setup workflow-videos directory:', error);
        // Continue with original result even if copy fails
      }
    }

    // Return result
    console.log(`✅ Workflow Complete: ${result.success ? 'SUCCESS' : 'FAILED'}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Generate Workflow API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════

function validateRequest(body: GenerateWorkflowRequest): { valid: boolean; error?: string } {
  // Check template type
  const validTemplates = ['single', 'series', 'no-human', 'asset-animation'];
  if (!validTemplates.includes(body.templateType)) {
    return { valid: false, error: `Invalid template type. Must be one of: ${validTemplates.join(', ')}` };
  }

  // Check config
  if (!body.config) {
    return { valid: false, error: 'config is required' };
  }

  // Check scenarios
  if (!body.config.scenarios || body.config.scenarios.length === 0) {
    return { valid: false, error: 'At least one scenario is required' };
  }

  // Template-specific validation
  if (body.templateType === 'series') {
    if (!body.config.character) {
      return { valid: false, error: 'Series template requires character config' };
    }
    if (body.config.scenarios.length < 2) {
      return { valid: false, error: 'Series template requires at least 2 scenarios' };
    }
  }

  if (body.templateType === 'asset-animation') {
    if (!body.assetConfig) {
      return { valid: false, error: 'Asset animation template requires assetConfig' };
    }
    if (!body.assetConfig.assetPrompt) {
      return { valid: false, error: 'assetConfig.assetPrompt is required' };
    }
    if (!body.assetConfig.assetType) {
      return { valid: false, error: 'assetConfig.assetType is required' };
    }
  }

  // Check VEO3 options
  if (!body.config.veo3Options) {
    return { valid: false, error: 'veo3Options is required' };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════
// OPTIONS (CORS)
// ═══════════════════════════════════════════════════════════════════════

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
