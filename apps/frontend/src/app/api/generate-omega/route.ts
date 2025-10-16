import { NextRequest, NextResponse } from "next/server";

// Main Omega generation endpoint with job queue management and comprehensive error handling
export async function POST(request: NextRequest) {
  try {
    const {
      characterName,
      userRequest,
      platform = "general",
      simpleMode = false,
      apiKey: userApiKey
    } = await request.json();

    if (!userRequest) {
      return NextResponse.json({
        error: "User request is required"
      }, { status: 400 });
    }

    if (!characterName) {
      return NextResponse.json({
        error: "Character name is required"
      }, { status: 400 });
    }

    // Use user-provided API key if available, otherwise fallback to environment variable
    const apiKey = userApiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "No API key provided. Please add your Google AI API key in the settings."
      }, { status: 401 });
    }

    console.log("🎬 Starting Omega generation:", {
      character: characterName,
      prompt: userRequest.substring(0, 100) + "...",
      platform,
      simpleMode
    });

    // Forward request to Omega Service on port 3007
    const omegaServiceUrl = "http://localhost:3007";

    try {
      // Call the Omega service's video generation endpoint
      const response = await fetch(`${omegaServiceUrl}/api/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          characterName,
          userRequest,
          platform,
          simpleMode,
          apiKey
        }),
        // Add timeout for long requests
        signal: AbortSignal.timeout(120000) // 2 minute timeout for job initiation
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Omega service error: ${response.status} - ${errorText}`);

        if (response.status === 404) {
          return NextResponse.json({
            error: "Omega generation service not available. Please ensure Omega service is running on port 3007."
          }, { status: 503 });
        }

        throw new Error(`Omega service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Omega generation job started: ${data.operationId}`);

        return NextResponse.json({
          success: true,
          operationId: data.operationId,
          message: data.message,
          estimatedTime: 300, // 5 minutes estimate
          statusEndpoint: `/api/omega-status/${data.operationId}`,
          metadata: {
            service: "omega",
            character: characterName,
            platform,
            simpleMode,
            startTime: new Date().toISOString()
          }
        });
      } else {
        throw new Error(data.error || "Omega generation failed to start");
      }

    } catch (fetchError) {
      console.error("❌ Failed to connect to Omega service:", fetchError);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({
          error: "Omega generation request timed out. Please try again."
        }, { status: 408 });
      }

      if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
        return NextResponse.json({
          error: "Cannot connect to Omega generation service. Please ensure Omega service is running on port 3007."
        }, { status: 503 });
      }

      throw fetchError;
    }

  } catch (error) {
    console.error("❌ Error in Omega generation:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: `Omega generation failed: ${errorMessage}`,
        service: "omega"
      },
      { status: 500 }
    );
  }
}
