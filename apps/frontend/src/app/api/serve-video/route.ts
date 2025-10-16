import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Define the Omega output directory
const OMEGA_OUTPUT_DIR = path.join(process.cwd(), "generated", "omega", "videos");
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".avi", ".mov"];

export async function GET(request: NextRequest) {
  try {
    // Get the video filename from query params
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("file");
    const operationId = searchParams.get("operationId");

    if (!filename) {
      return NextResponse.json({
        error: "Filename is required"
      }, { status: 400 });
    }

    // Security validation: prevent path traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({
        error: "Invalid filename"
      }, { status: 400 });
    }

    // Validate file extension
    const fileExt = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`
      }, { status: 400 });
    }

    // Construct the full file path
    const filePath = operationId
      ? path.join(OMEGA_OUTPUT_DIR, operationId, filename)
      : path.join(OMEGA_OUTPUT_DIR, filename);

    console.log(`📹 Serving video: ${filePath}`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`❌ Video file not found: ${filePath}`);
      return NextResponse.json({
        error: "Video file not found"
      }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    const stat = await fs.stat(filePath);

    // Determine content type based on extension
    const contentType = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime"
    }[fileExt] || "video/mp4";

    // Support range requests for video streaming
    const range = request.headers.get("range");

    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = (end - start) + 1;

      // Create partial content response
      const headers = new Headers({
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      });

      // Return partial content (206)
      return new NextResponse(
        fileBuffer.slice(start, end + 1),
        {
          status: 206,
          headers
        }
      );
    } else {
      // Return full file
      const headers = new Headers({
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${filename}"`,
      });

      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      });
    }
  } catch (error) {
    console.error("❌ Error serving video:", error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to serve video"
    }, { status: 500 });
  }
}

// Handle HEAD requests for video metadata
export async function HEAD(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("file");
    const operationId = searchParams.get("operationId");

    if (!filename) {
      return NextResponse.json({
        error: "Filename is required"
      }, { status: 400 });
    }

    // Security validation
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({
        error: "Invalid filename"
      }, { status: 400 });
    }

    const fileExt = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({
        error: "Invalid file type"
      }, { status: 400 });
    }

    const filePath = operationId
      ? path.join(OMEGA_OUTPUT_DIR, operationId, filename)
      : path.join(OMEGA_OUTPUT_DIR, filename);

    try {
      const stat = await fs.stat(filePath);

      const contentType = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime"
      }[fileExt] || "video/mp4";

      const headers = new Headers({
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      });

      return new NextResponse(null, {
        status: 200,
        headers
      });
    } catch (error) {
      return NextResponse.json({
        error: "Video file not found"
      }, { status: 404 });
    }
  } catch (error) {
    console.error("❌ Error getting video metadata:", error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to get video metadata"
    }, { status: 500 });
  }
}