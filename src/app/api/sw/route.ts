import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(_request: NextRequest) {
  try {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    const swContent = await readFile(swPath, 'utf-8');
    
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Service-Worker-Allowed': '/',
      },
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Service Worker not found', { status: 404 });
  }
}
