// app/api/video/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Construct path to your Payload media directory
    const filePath = path.join(process.cwd(), 'media', filename);
    
    // Security check - ensure file exists and is in media directory
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Verify it's a video file
    if (!filename.toLowerCase().endsWith('.mp4')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Handle range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const stream = fs.createReadStream(filePath, { start, end });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // Full file request
    const stream = fs.createReadStream(filePath);
    
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Video streaming error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}