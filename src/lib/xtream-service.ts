import { Category, LiveStream, VODStream, Series } from './types';

const XTREAM_CONFIG = {
    baseUrl: 'http://opplex.rw:8080',
    username: '4566900',
    password: '3374019',
};

export class XtreamService {
    private static cleanASCII(str: string): string {
        // Remove non-ASCII characters
        return str.replace(/[^\x00-\x7F]/g, "").trim();
    }

    private static proxyUrl(url: string, referer?: string): string {
        let proxied = `/api/proxy?url=${encodeURIComponent(url)}`;
        if (referer) {
            proxied += `&referer=${encodeURIComponent(referer)}`;
        }
        return proxied;
    }

    /**
     * Fetches the full M3U and splits it based on the user's manual process,
     * but automated. Note: Using player_api.php is generally more robust
     * for JSON-based browsing, but we provide this for parity with user's doc.
     */
    static async getFullM3U() {
        const url = `${XTREAM_CONFIG.baseUrl}/get.php?username=${XTREAM_CONFIG.username}&password=${XTREAM_CONFIG.password}&type=m3u_plus&output=ts`;
        const response = await fetch(this.proxyUrl(url));
        if (!response.ok) throw new Error('Failed to fetch M3U');
        return await response.text();
    }

    /**
     * Split M3U into categories (Live, Series, Movies) and clean ASCII
     */
    static splitAndCleanM3U(m3uContent: string) {
        const lines = m3uContent.split('\n');
        const result = {
            live: ['#EXTM3U'],
            movie: ['#EXTM3U'],
            series: ['#EXTM3U']
        };

        let currentHeader = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF')) {
                currentHeader = this.cleanASCII(line);
                const nextLine = lines[i + 1]?.trim();
                if (nextLine && !nextLine.startsWith('#')) {
                    // Check group-title or URL structure
                    if (currentHeader.toLowerCase().includes('movie') || nextLine.includes('/movie/')) {
                        result.movie.push(currentHeader);
                        result.movie.push(nextLine);
                    } else if (currentHeader.toLowerCase().includes('series') || nextLine.includes('/series/')) {
                        result.series.push(currentHeader);
                        result.series.push(nextLine);
                    } else {
                        result.live.push(currentHeader);
                        result.live.push(nextLine);
                    }
                    i++; // skip the URL line
                }
            }
        }

        return {
            live: result.live.join('\n'),
            movie: result.movie.join('\n'),
            series: result.series.join('\n')
        };
    }

    /**
     * Preferred way: Use player_api.php for structured data
     */
    private static async fetchApi<T>(action: string, params: Record<string, string> = {}): Promise<T> {
        const url = new URL(`${XTREAM_CONFIG.baseUrl}/player_api.php`);
        url.searchParams.set('username', XTREAM_CONFIG.username);
        url.searchParams.set('password', XTREAM_CONFIG.password);
        url.searchParams.set('action', action);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

        const response = await fetch(this.proxyUrl(url.toString()));
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        // Handle potential non-ASCII in JSON body manually if needed, 
        // but response.json() usually handles it. 
        // We'll clean the names after parsing.
        const data = await response.json();
        return this.cleanData(data);
    }

    private static cleanData(data: any): any {
        if (Array.isArray(data)) {
            return data.map(item => this.cleanObject(item));
        }
        return this.cleanObject(data);
    }

    private static cleanObject(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                cleaned[key] = this.cleanASCII(value);
            } else if (typeof value === 'object') {
                cleaned[key] = this.cleanData(value);
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }

    static async getLiveStreams(categoryId?: string) {
        return this.fetchApi<LiveStream[]>('get_live_streams', categoryId ? { category_id: categoryId } : {});
    }

    static async getLiveCategories() {
        return this.fetchApi<Category[]>('get_live_categories');
    }

    static buildStreamUrl(streamId: string | number, type: 'live' | 'movie' | 'series' = 'live'): string {
        // Per user doc: http://server:port/live/user/pass/ID.ts
        const ext = type === 'live' ? 'm3u8' : 'mp4'; // m3u8 often works better for HLS live streams
        const url = `${XTREAM_CONFIG.baseUrl}/${type}/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.${ext}`;
        return this.proxyUrl(url);
    }
}
