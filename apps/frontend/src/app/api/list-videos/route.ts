import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const veo3Dir = path.join(publicDir, 'generated', 'veo3');

    // Ensure directory exists
    try {
      await fs.access(veo3Dir);
    } catch {
      // Directory doesn't exist, return empty array
      return NextResponse.json({ success: true, videos: [] });
    }

    // Read all files from veo3 directory
    const files = await fs.readdir(veo3Dir);

    // Filter for video files and get file stats
    const videoFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.webm'))
        .map(async (file) => {
          const filePath = path.join(veo3Dir, file);
          const stats = await fs.stat(filePath);

          return {
            id: `veo3-${file}`,
            title: file.replace(/_/g, ' ').replace('.mp4', '').replace('veo3 video ', ''),
            type: 'veo3' as const,
            videoUrl: `/generated/veo3/${file}`,
            duration: 8, // Default duration
            cost: 1.2, // Default VEO3 fast cost
            timestamp: stats.mtime.getTime(),
            model: 'veo-3.0-fast',
            generationTime: 120, // Default
            branded: file.includes('_branded')
          };
        })
    );

    // Sort by timestamp (newest first)
    videoFiles.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      videos: videoFiles,
      count: videoFiles.length
    });
  } catch (error) {
    console.error('Error listing videos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list videos'
      },
      { status: 500 }
    );
  }
}
