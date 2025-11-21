import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driveUrl = searchParams.get('url');

  if (!driveUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  function extractFileId(url: string): string | null {
    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match && match[1]) return match[1];
    if (/^[a-zA-Z0-9_-]+$/.test(url)) return url;
    return null;
  }

  const fileId = extractFileId(driveUrl);
  if (!fileId) {
    return NextResponse.json({ error: 'Invalid Google Drive URL or ID' }, { status: 400 });
  }

  const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  try {
    const res = await fetch(directUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from Google Drive' }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return NextResponse.json({ base64: `data:${contentType};base64,${base64}` });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown server error' }, { status: 500 });
  }
}
