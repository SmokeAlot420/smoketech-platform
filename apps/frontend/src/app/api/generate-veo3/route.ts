import { NextRequest, NextResponse } from "next/server";
import { VideoModel, VideoDuration, EnhancementLevel, videoModels } from "@/lib/video-model-types";

interface VEO3Request {
  prompt: string;
  videoModel: VideoModel;
  duration: VideoDuration;
  platform?: string;
  enhancementLevel?: EnhancementLevel;
  useChaining?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: VEO3Request = await request.json();
    const { prompt, videoModel, duration, platform, enhancementLevel, useChaining } = body;

    // Validate required parameters
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!videoModel) {
      return NextResponse.json({ error: "Video model is required" }, { status: 400 });
    }

    if (!duration) {
      return NextResponse.json({ error: "Duration is required" }, { status: 400 });
    }

    // Validate video model
    const modelConfig = videoModels.find(m => m.id === videoModel);
    if (!modelConfig) {
      return NextResponse.json({
        error: `Invalid video model: ${videoModel}`
      }, { status: 400 });
    }

    // Validate duration
    if (![4, 6, 8].includes(duration)) {
      return NextResponse.json({
        error: "Duration must be 4, 6, or 8 seconds"
      }, { status: 400 });
    }

    // Calculate estimated cost
    const baseCost = modelConfig.costPer4s * (duration / 4);
    const enhancementCost = enhancementLevel && enhancementLevel !== 'none'
      ? 0.0005 // Rough estimate for Gemini enhancement
      : 0;
    const estimatedCost = baseCost + enhancementCost;

    // Calculate estimated time (in seconds)
    const estimatedTime = duration === 4 ? 180 : duration === 6 ? 240 : 300;

    // Generate operation ID
    const operationId = `veo3_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log(`VEO3 generation request:`, {
      operationId,
      prompt: prompt.substring(0, 50) + '...',
      videoModel,
      duration,
      platform,
      enhancementLevel,
      estimatedCost
    });

    // Forward to omega-service.js bridge
    const OMEGA_SERVICE_URL = process.env.OMEGA_SERVICE_URL || 'http://localhost:3007';

    try {
      const response = await fetch(`${OMEGA_SERVICE_URL}/api/generate-veo3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          videoModel,
          duration,
          platform,
          enhancementLevel,
          useChaining,
          operationId
        }),
      });

      if (!response.ok) {
        throw new Error(`Omega service returned ${response.status}`);
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        operationId,
        estimatedCost: parseFloat(estimatedCost.toFixed(2)),
        estimatedTime: `${Math.floor(estimatedTime / 60)}-${Math.ceil(estimatedTime / 60)} minutes`,
        status: "processing",
        message: "Video generation started. Use the operation ID to check status.",
        ...result
      });

    } catch (omegaError) {
      console.error("Error forwarding to omega-service:", omegaError);
      return NextResponse.json({
        error: "Omega service unavailable. Make sure omega-service.js is running on port 3007.",
        details: omegaError instanceof Error ? omegaError.message : String(omegaError)
      }, { status: 503 });
    }

  } catch (error) {
    console.error("Error in VEO3 generation endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to process VEO3 generation request",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
