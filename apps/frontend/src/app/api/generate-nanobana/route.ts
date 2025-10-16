import { NextRequest, NextResponse } from "next/server";

// NanoBanana API route - forwards to Omega Service for ultra-realistic image generation
export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey: userApiKey, numberOfImages } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Use user-provided API key if available, otherwise fallback to environment variable
    const apiKey = userApiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "No API key provided. Please add your Google AI API key in the settings."
      }, { status: 401 });
    }

    const imageCount = numberOfImages || 1;
    console.log("🍌 Generating NanoBanana images for prompt:", prompt);
    console.log(`🔢 Requested image count: ${imageCount}`);

    // Forward request to Omega Service on port 3007
    const omegaServiceUrl = "http://localhost:3007";

    try {
      // Call the Omega service's NanoBanana endpoint with viral engine integration
      const response = await fetch(`${omegaServiceUrl}/api/generate-nanobana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt,
          model: 'nanobana',
          apiKey,
          numberOfImages: imageCount
        }),
        // Add timeout for long requests
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Omega service error: ${response.status} - ${errorText}`);

        if (response.status === 404) {
          return NextResponse.json({
            error: "NanoBanana service not available. Please ensure Omega service is running on port 3007."
          }, { status: 503 });
        }

        throw new Error(`Omega service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ NanoBanana generation successful: ${data.images?.length || 0} images`);
        return NextResponse.json({
          success: true,
          images: data.images,
          prompt,
          model: 'nanobana',
          metadata: {
            source: 'nanobana',
            service: 'omega',
            cost: 0.02 * (data.images?.length || 1)
          }
        });
      } else {
        throw new Error(data.error || 'NanoBanana generation failed');
      }

    } catch (fetchError) {
      console.error("❌ Failed to connect to Omega service:", fetchError);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: "NanoBanana generation timed out. Please try again."
        }, { status: 408 });
      }

      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        return NextResponse.json({
          error: "Cannot connect to NanoBanana service. Please ensure Omega service is running on port 3007."
        }, { status: 503 });
      }

      throw fetchError;
    }

  } catch (error) {
    console.error("❌ Error in NanoBanana generation:", error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: `NanoBanana generation failed: ${errorMessage}`,
        service: 'nanobana'
      },
      { status: 500 }
    );
  }
}