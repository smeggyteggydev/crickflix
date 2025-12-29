import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    let targetUrl = searchParams.get('url');

    // Support Base64 encoded URLs to bypass some basic WAF filters
    if (targetUrl && !targetUrl.startsWith('http')) {
        try {
            targetUrl = Buffer.from(targetUrl, 'base64').toString('utf-8');
        } catch (e) {
            // Not base64, continue
        }
    }

    if (!targetUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const targetUrlObj = new URL(targetUrl);

        // Aggressive Spoofed Headers - Mirroring a high-end desktop browser exactly
        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        headers.set('Referer', targetUrlObj.origin + '/');
        headers.set('Origin', targetUrlObj.origin);
        headers.set('Accept', '*/*');
        headers.set('Sec-Fetch-Dest', 'empty');
        headers.set('Sec-Fetch-Mode', 'cors');
        headers.set('Sec-Fetch-Site', 'cross-site');
        headers.set('Connection', 'keep-alive');

        // Fetch the content with a timeout to avoid hangs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(targetUrl, {
            headers,
            cache: 'no-store',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // If 403, it means the provider is still seeing through us. 
            // Log the failure to help debugging if needed (invisible to user)
            return new NextResponse(`Bridge Error: ${response.status}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || '';

        // Handle HLS Manifest Rewriting (.m3u8)
        if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || targetUrl.includes('.m3u8')) {
            let text = await response.text();
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

            // Rewrite the manifest lines
            const lines = text.split('\n');
            const proxiedLines = lines.map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const absoluteUrl = trimmedLine.startsWith('http') ? trimmedLine : new URL(trimmedLine, baseUrl).href;
                    // Use Base64 for sub-segments too
                    const b64Url = Buffer.from(absoluteUrl).toString('base64');
                    return `/api/proxy?url=${b64Url}`;
                }
                return line;
            });

            return new NextResponse(proxiedLines.join('\n'), {
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            });
        }

        // Handle TS Segments - Passthrough with cors
        const data = await response.arrayBuffer();
        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType || 'video/MP2T',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        return new NextResponse(`Bridge Failure: ${error.message}`, { status: 500 });
    }
}
