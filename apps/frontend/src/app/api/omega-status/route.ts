import { NextRequest, NextResponse } from "next/server";
import { getOmegaBridge } from "@/lib/omega-bridge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const bridge = getOmegaBridge();
    const job = bridge.getJobStatus(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Return job status with progress updates
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        startTime: job.startTime,
        endTime: job.endTime,
        request: {
          character: job.request.character,
          preset: job.request.preset,
          platform: job.request.platform,
          prompt: job.request.prompt.substring(0, 100) + (job.request.prompt.length > 100 ? '...' : '')
        },
        progress: job.progress,
        result: job.result,
        estimatedTimeRemaining: job.status === 'running' ?
          Math.max(0, 25 * 60 * 1000 - (Date.now() - job.startTime)) : 0
      }
    });

  } catch (error) {
    console.error("❌ Error getting job status:", error);
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}

// Get stats for all jobs
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    const bridge = getOmegaBridge();

    if (action === 'stats') {
      const stats = bridge.getStats();
      const activeJobs = bridge.getActiveJobs().map(job => ({
        id: job.id,
        status: job.status,
        character: job.request.character,
        preset: job.request.preset,
        startTime: job.startTime,
        progress: job.progress[job.progress.length - 1] || null
      }));

      return NextResponse.json({
        success: true,
        stats,
        activeJobs
      });
    }

    if (action === 'cancel') {
      const { jobId } = await request.json();
      if (!jobId) {
        return NextResponse.json(
          { error: "Job ID is required for cancel action" },
          { status: 400 }
        );
      }

      const cancelled = bridge.cancelJob(jobId);
      return NextResponse.json({
        success: cancelled,
        message: cancelled ? "Job cancelled successfully" : "Failed to cancel job or job not found"
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'stats' or 'cancel'" },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Error in omega status operation:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}