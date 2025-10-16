import { NextRequest, NextResponse } from "next/server";

// Progress tracking endpoint with WebSocket upgrade capability for real-time updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;

    if (!operationId) {
      return NextResponse.json({
        error: "Operation ID is required"
      }, { status: 400 });
    }

    console.log(`📊 Checking status for operation: ${operationId}`);

    // Forward request to Omega Service on port 3007
    const omegaServiceUrl = "http://localhost:3007";

    try {
      const response = await fetch(`${omegaServiceUrl}/api/status/${operationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout for status check
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({
            error: "Operation not found",
            operationId
          }, { status: 404 });
        }

        const errorText = await response.text();
        console.error(`❌ Omega status error: ${response.status} - ${errorText}`);
        throw new Error(`Status check failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Enhance response with additional metadata
      const enhancedResponse = {
        ...data,
        operationId,
        lastChecked: new Date().toISOString(),
        statusEndpoint: `/api/omega-status/${operationId}`,
        refreshInterval: data.status === "completed" ? null : 5000, // 5 seconds if still processing
        canCancel: data.status === "processing" || data.status === "pending"
      };

      console.log(`✅ Status check successful: ${data.status} (${data.progress}%)`);
      return NextResponse.json(enhancedResponse);

    } catch (fetchError) {
      console.error("❌ Failed to connect to Omega service:", fetchError);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({
          error: "Status check timed out",
          operationId
        }, { status: 408 });
      }

      if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
        return NextResponse.json({
          error: "Cannot connect to Omega service. Please ensure Omega service is running on port 3007.",
          operationId
        }, { status: 503 });
      }

      throw fetchError;
    }

  } catch (error) {
    console.error("❌ Error in status check:", error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Status check failed",
      operationId: operationId
    }, { status: 500 });
  }
}

// Handle POST requests for operation control (pause, resume, cancel)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    const { action } = await request.json();

    if (!operationId) {
      return NextResponse.json({
        error: "Operation ID is required"
      }, { status: 400 });
    }

    if (!action || !["cancel", "pause", "resume"].includes(action)) {
      return NextResponse.json({
        error: "Valid action is required (cancel, pause, resume)"
      }, { status: 400 });
    }

    console.log(`🎮 Controlling operation ${operationId}: ${action}`);

    // For now, return a placeholder response
    // TODO: Implement actual operation control in omega service
    return NextResponse.json({
      success: true,
      operationId,
      action,
      message: `Operation ${action} requested`,
      note: "Operation control not yet implemented in omega service"
    });

  } catch (error) {
    console.error("❌ Error in operation control:", error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Operation control failed",
      operationId: operationId
    }, { status: 500 });
  }
}

// Handle WebSocket upgrade for real-time updates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;

    if (!operationId) {
      return NextResponse.json({
        error: "Operation ID is required"
      }, { status: 400 });
    }

    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get("upgrade");
    if (upgrade === "websocket") {
      // TODO: Implement WebSocket upgrade for real-time status updates
      // This would require additional WebSocket handling infrastructure
      
      return NextResponse.json({
        error: "WebSocket upgrade not yet implemented",
        alternative: `Use polling with GET /api/omega-status/${operationId}`,
        recommendedInterval: 5000
      }, { status: 501 });
    }

    return NextResponse.json({
      error: "Invalid request method for this endpoint"
    }, { status: 405 });

  } catch (error) {
    console.error("❌ Error in WebSocket upgrade:", error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : "WebSocket upgrade failed",
      operationId: operationId
    }, { status: 500 });
  }
}
