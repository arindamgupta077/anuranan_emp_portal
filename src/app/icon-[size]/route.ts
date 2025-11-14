import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(
  _request: NextRequest,
  { params }: { params: { size: string } }
) {
  try {
    // Validate size to prevent path traversal
    const validSizes = ['192', '512'];
    const size = params.size;
    
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
