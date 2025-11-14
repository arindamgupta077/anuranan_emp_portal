import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Extract size from filename (icon-192.png -> 192)
    const match = params.filename.match(/^icon-(\d+)\.png$/);
    
    if (!match) {
      return new NextResponse('Invalid icon filename', { status: 404 });
    }
    
    const size = match[1];
    const validSizes = ['192', '512'];
    
    if (!validSizes.includes(size)) {
      return new NextResponse('Invalid icon size', { status: 404 });
    }
    
    const iconPath = path.join(process.cwd(), 'public', `icon-${size}.png`);
    const iconContent = await readFile(iconPath);
    
    return new NextResponse(iconContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving icon:', error);
    return new NextResponse('Icon not found', { status: 404 });
  }
}
