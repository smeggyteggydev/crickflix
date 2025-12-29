/**
 * Cloudflare Worker: CricFlix HTTPS Proxy
 * This script allows you to stream HTTP channels on an HTTPS website.
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)

    // Get the target URL from the query parameter
    // Usage: https://your-worker.workers.dev/?url=http://example.com/stream.m3u8
    let targetUrl = url.searchParams.get('url')

    // If no param, try path-based proxying
    // Usage: https://your-worker.workers.dev/http://example.com/stream.m3u8
    if (!targetUrl) {
        targetUrl = request.url.replace(url.origin + '/', '')
    }

    if (!targetUrl || !targetUrl.startsWith('http')) {
        return new Response('Invalid target URL', { status: 400 })
    }

    // Clone headers and remove ones that might cause issues with providers
    const newHeaders = new Headers(request.headers)
    newHeaders.delete('Host')
    newHeaders.delete('Referer')

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: newHeaders,
            redirect: 'follow'
        })

        // Create a new response with CORS headers
        const proxyResponse = new Response(response.body, response)
        proxyResponse.headers.set('Access-Control-Allow-Origin', '*')
        proxyResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
        proxyResponse.headers.set('Access-Control-Allow-Headers', '*')

        return proxyResponse
    } catch (e) {
        return new Response('Proxy Error: ' + e.message, { status: 500 })
    }
}
