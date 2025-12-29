import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const targetUrlObj = new URL(targetUrl);

        // 1. Setup Spoofed Headers
        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        headers.set('Referer', targetUrlObj.origin + '/');
        headers.set('Origin', targetUrlObj.origin);
        headers.set('Accept', '*/*');
        headers.set('Accept-Language', 'en-US,en;q=0.9');

        // 2. Fetch the content
        const response = await fetch(targetUrl, {
            headers,
            cache: 'no-store'
        });

        if (!response.ok) {
            return new NextResponse(`Upstream Error: ${response.status} ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || '';

        // 3. Handle HLS Manifest Rewriting (.m3u8)
        // This ensures segments (.ts files) are also proxied to avoid 403/Mixed Content on sub-requests
        if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || targetUrl.endsWith('.m3u8')) {
            let text = await response.text();
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

            // Replace relative paths with proxied absolute paths
            // This is a "Nuclear Fix" for HLS playback through a proxy
            const proxiedText = text.split('\n').map(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const absoluteUrl = line.startsWith('http') ? line : new URL(line, baseUrl).href;
                    return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                }
                return line;
            }).join('\n');

            return new NextResponse(proxiedText, {
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            });
        }

        // 4. Handle Binary Segments (.ts, etc.)
        const data = await response.arrayBuffer();
        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        return new NextResponse(`Proxy Critical Failure: ${error.message}`, { status: 500 });
    }
}
