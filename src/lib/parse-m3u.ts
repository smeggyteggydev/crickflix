import { ParsedM3UChannel } from './types';

// Parse M3U file content into structured channel data
export function parseM3U(content: string): ParsedM3UChannel[] {
    const lines = content.split('\n');
    const channels: ParsedM3UChannel[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#EXTINF:')) {
            // Parse channel info line
            const groupMatch = line.match(/group-title="([^"]*)"/);
            const nameMatch = line.match(/,\s*(.+)$/);

            // Next line should be the URL
            const urlLine = lines[i + 1]?.trim();

            if (urlLine && urlLine.startsWith('http')) {
                // Extract stream ID from URL (could be .m3u8, .ts, or just a number)
                const streamIdMatch = urlLine.match(/\/(\d+)(\.[a-z0-9]+)?$/);

                channels.push({
                    name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
                    groupTitle: groupMatch ? groupMatch[1] : 'Other Sports',
                    url: urlLine,
                    streamId: streamIdMatch ? streamIdMatch[1] : '',
                });
            }
        }
    }

    return channels;
}

// Group channels by category
export function groupChannelsByCategory(channels: ParsedM3UChannel[]): Map<string, ParsedM3UChannel[]> {
    const grouped = new Map<string, ParsedM3UChannel[]>();

    channels.forEach(channel => {
        const category = channel.groupTitle || 'Other';
        if (!grouped.has(category)) {
            grouped.set(category, []);
        }
        grouped.get(category)!.push(channel);
    });

    return grouped;
}

// Filter sports channels
export function filterSportsChannels(channels: ParsedM3UChannel[]): ParsedM3UChannel[] {
    const sportsKeywords = [
        'sport', 'cricket', 'football', 'soccer', 'tennis', 'golf',
        'nba', 'nfl', 'mlb', 'espn', 'sky sports', 'star sports',
        'ten sports', 'sony ten', 'ptv sports', 'geo super', 'willow',
        'bein', 'supersport', 'eurosport', 'fox sports', 't-sports',
        'matchroom', 'dazn', 'tnt sport'
    ];

    return channels.filter(channel => {
        const name = channel.name.toLowerCase();
        return sportsKeywords.some(keyword => name.includes(keyword));
    });
}
