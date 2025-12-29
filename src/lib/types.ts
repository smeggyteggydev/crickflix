// Xtream API Types

export interface Category {
    category_id: string;
    category_name: string;
    parent_id: number;
}

export interface LiveStream {
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    stream_icon: string;
    epg_channel_id: string | null;
    added: string;
    is_adult: string;
    category_id: string;
    custom_sid: string;
    tv_archive: number;
    direct_source: string;
    tv_archive_duration: number;
}

export interface VODStream {
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    stream_icon: string;
    rating: string;
    rating_5based: number;
    added: string;
    is_adult: string;
    category_id: string;
    container_extension: string;
    custom_sid: string;
    direct_source: string;
}

export interface Series {
    num: number;
    name: string;
    series_id: number;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    last_modified: string;
    rating: string;
    rating_5based: number;
    backdrop_path: string[];
    youtube_trailer: string;
    episode_run_time: string;
    category_id: string;
}

export interface Channel {
    id: string;
    name: string;
    icon: string;
    url: string;
    category: string;
    servers?: { label: string; url: string }[];
}

export interface ParsedM3UChannel {
    name: string;
    groupTitle?: string;
    url: string;
    streamId?: string;
    logo?: string;
    category?: string;
    servers?: { label: string; url: string }[];
}
