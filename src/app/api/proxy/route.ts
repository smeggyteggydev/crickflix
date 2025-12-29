import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            return new NextResponse(`Proxy error: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type');
        const data = await response.arrayBuffer();

        // Return the response with proper headers for HLS
        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType || 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        return new NextResponse(`Proxy failed: ${error.message}`, { status: 500 });
    }
}
