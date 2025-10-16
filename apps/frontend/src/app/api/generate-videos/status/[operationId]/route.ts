import { NextRequest, NextResponse } from "next/server";
import { operationStore } from "@/lib/operationStore";

/**
 * GET /api/generate-videos/status/[operationId]
 * Returns the current status of a video generation operation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;

    if (!operationId) {
      return NextResponse.json(
        { error: "Operation ID is required" },
        { status: 400 }
      );
    }

    // Get operation from store
    const operation = await operationStore.get(operationId);

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    // Return current status
    return NextResponse.json({
      operationId: operation.id,
      status: operation.status,
      progress: operation.progress,
      message: operation.message,
      result: operation.result,
      error: operation.error,
      updatedAt: operation.updatedAt,
    });

  } catch (error) {
    console.error("Error fetching operation status:", error);
    return NextResponse.json(
      { error: "Failed to fetch operation status" },
      { status: 500 }
    );
  }
}

