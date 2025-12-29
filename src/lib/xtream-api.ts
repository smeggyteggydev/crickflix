import { Category, LiveStream, VODStream, Series } from './types';

// Xtream API Configuration
const XTREAM_CONFIG = {
    baseUrl: 'http://opplex.rw:8080',
    username: '4566900',
    password: '3374019',
};

// Helper to remove non-ASCII characters from strings (prevents parsing errors)
function cleanASCII(str: string): string {
    return str.replace(/[^\x00-\x7F]/g, "").trim();
}

// Helper to create proxied URL (only for client-side)
function proxyUrl(url: string, referer?: string): string {
    // If we're on the server, we don't need the proxy to bypass CORS
    // but we must use it for header consistency. 
    // However, it's safer and faster to fetch directly on the server.
    if (typeof window === 'undefined') {
        return url;
    }

    let proxied = `/api/proxy?url=${encodeURIComponent(url)}`;
    if (referer) {
        proxied += `&referer=${encodeURIComponent(referer)}`;
    }
    return proxied;
}

// Build API URL
function buildApiUrl(action: string, params: Record<string, string> = {}): string {
    const url = new URL(`${XTREAM_CONFIG.baseUrl}/player_api.php`);
    url.searchParams.set('username', XTREAM_CONFIG.username);
    url.searchParams.set('password', XTREAM_CONFIG.password);
    url.searchParams.set('action', action);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
}

// Build Stream URL
export function buildStreamUrl(streamId: number | string, type: 'live' | 'movie' | 'series' = 'live'): string {
    // Per user documentation: construct the live stream URL using the direct .ts format
    // http://server.iptv:8080/live/YOURUSERNAME/YOURPASSWORD/STREAM_ID.ts
    const extension = type === 'live' ? 'ts' : 'mp4';
    const url = `${XTREAM_CONFIG.baseUrl}/${type}/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.${extension}`;
    return proxyUrl(url);
}

// Common headers used by the proxy to ensure consistency
const PLAYER_HEADERS = {
    'User-Agent': 'IPTVSmartersPlayer',
    'Accept': '*/*',
    'Connection': 'keep-alive',
};

// Fetch with error handling and ASCII cleaning
async function fetchApi<T>(url: string): Promise<T> {
    const isServer = typeof window === 'undefined';
    const targetUrl = proxyUrl(url);

    const response = await fetch(targetUrl, {
        headers: isServer ? PLAYER_HEADERS : {},
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();
    return cleanData(data);
}

// Recursively clean non-ASCII characters from API response data
function cleanData(data: any): any {
    if (Array.isArray(data)) {
        return data.map(item => cleanObject(item));
    }
    return cleanObject(data);
}

function cleanObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            cleaned[key] = cleanASCII(value);
        } else if (typeof value === 'object' && value !== null) {
            cleaned[key] = cleanData(value);
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

// M3U Automation Functions
export async function getFullM3U(): Promise<string> {
    const url = `${XTREAM_CONFIG.baseUrl}/get.php?username=${XTREAM_CONFIG.username}&password=${XTREAM_CONFIG.password}&type=m3u_plus&output=ts`;
    const isServer = typeof window === 'undefined';
    const targetUrl = proxyUrl(url);

    console.log(`[XtreamAPI] getFullM3U: Fetching from ${targetUrl} (isServer: ${isServer})`);

    const response = await fetch(targetUrl, {
        headers: isServer ? PLAYER_HEADERS : {},
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error body');
        console.error(`[XtreamAPI] getFullM3U failed: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch M3U: ${response.status} ${response.statusText}`);
    }

    return await response.text();
}

/**
 * Automates the manual splitting process described in the user documentation.
 * Splits the single large M3U file into three parts: Live, Serie, and Movie.
 */
export function splitAndCleanM3U(m3uContent: string) {
    console.time('splitAndCleanM3U');
    const lines = m3uContent.split('\n');
    console.log(`[XtreamAPI] Processing ${lines.length} lines...`);

    const result = {
        live: ['#EXTM3U'],
        movie: ['#EXTM3U'],
        series: ['#EXTM3U']
    };

    const len = lines.length;
    for (let i = 0; i < len; i++) {
        const line = lines[i];
        if (!line) continue;

        const trimmed = line.trim();
        if (trimmed.startsWith('#EXTINF')) {
            const nextLine = lines[i + 1]?.trim();
            if (nextLine && !nextLine.startsWith('#')) {
                const cleanedHeader = cleanASCII(trimmed);
                const lowerHeader = cleanedHeader.toLowerCase();
                const lowerUrl = nextLine.toLowerCase();

                if (lowerHeader.includes('movie') || lowerUrl.includes('/movie/')) {
                    result.movie.push(cleanedHeader, nextLine);
                } else if (lowerHeader.includes('series') || lowerUrl.includes('/series/')) {
                    result.series.push(cleanedHeader, nextLine);
                } else {
                    result.live.push(cleanedHeader, nextLine);
                }
                i++; // Skip the URL line
            }
        }
    }

    console.timeEnd('splitAndCleanM3U');
    console.log(`[XtreamAPI] Split results: Live: ${result.live.length / 2}, Movie: ${result.movie.length / 2}, Series: ${result.series.length / 2}`);

    return {
        live: result.live.join('\n'),
        movie: result.movie.join('\n'),
        series: result.series.join('\n')
    };
}

// API Functions
export async function getLiveCategories(): Promise<Category[]> {
    const url = buildApiUrl('get_live_categories');
    return fetchApi<Category[]>(url);
}

export async function getLiveStreams(categoryId?: string): Promise<LiveStream[]> {
    const params: Record<string, string> = categoryId ? { category_id: categoryId } : {};
    const url = buildApiUrl('get_live_streams', params);
    return fetchApi<LiveStream[]>(url);
}

export async function getVODCategories(): Promise<Category[]> {
    const url = buildApiUrl('get_vod_categories');
    return fetchApi<Category[]>(url);
}

export async function getVODStreams(categoryId?: string): Promise<VODStream[]> {
    const params: Record<string, string> = categoryId ? { category_id: categoryId } : {};
    const url = buildApiUrl('get_vod_streams', params);
    return fetchApi<VODStream[]>(url);
}

export async function getSeriesCategories(): Promise<Category[]> {
    const url = buildApiUrl('get_series_categories');
    return fetchApi<Category[]>(url);
}

export async function getSeries(categoryId?: string): Promise<Series[]> {
    const params: Record<string, string> = categoryId ? { category_id: categoryId } : {};
    const url = buildApiUrl('get_series', params);
    return fetchApi<Series[]>(url);
}

export async function getSeriesInfo(seriesId: string): Promise<unknown> {
    const url = buildApiUrl('get_series_info', { series_id: seriesId });
    return fetchApi(url);
}

export async function getVODInfo(vodId: string): Promise<unknown> {
    const url = buildApiUrl('get_vod_info', { vod_id: vodId });
    return fetchApi(url);
}

export async function getShortEPG(streamId: string, limit: number = 4): Promise<unknown> {
    const url = buildApiUrl('get_short_epg', { stream_id: streamId, limit: limit.toString() });
    return fetchApi(url);
}
