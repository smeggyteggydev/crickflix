'use client';

import React from 'react';
import { ParsedM3UChannel } from '@/lib/types';

interface ChannelSidebarProps {
    channels: ParsedM3UChannel[];
    currentChannel: ParsedM3UChannel | null;
    onChannelSelect: (channel: ParsedM3UChannel) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChannelSidebar({
    channels,
    currentChannel,
    onChannelSelect,
    isOpen,
    onClose
}: ChannelSidebarProps) {
    // Clean channel name
    const cleanName = (name: string) => {
        return name
            .replace(/^\|[A-Z]{2}\|?\s*/, '')
            .replace(/^[A-Z]{2}:\s*/, '')
            .replace(/\*+$/, '')
            .trim();
    };

    // Get initials
    const getInitials = (name: string) => {
        return cleanName(name)
            .split(' ')
            .slice(0, 2)
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    // Generate color
    const getColor = (name: string) => {
        const colors = [
            'bg-purple-500', 'bg-red-500', 'bg-green-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-cyan-500'
        ];
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`channel-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Quick Switch</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search channels..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </div>

                {/* Channel List */}
                <div className="space-y-2">
                    {channels.map((channel, index) => {
                        const isActive = currentChannel?.streamId === channel.streamId;

                        return (
                            <div
                                key={`${channel.streamId}-${index}`}
                                className={`sidebar-channel ${isActive ? 'active' : ''}`}
                                onClick={() => onChannelSelect(channel)}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl ${getColor(channel.name)} flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-white font-bold text-sm">{getInitials(channel.name)}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm truncate">
                                        {cleanName(channel.name)}
                                    </p>
                                    <p className="text-white/40 text-xs truncate">
                                        {channel.groupTitle}
                                    </p>
                                </div>

                                {/* Live Indicator */}
                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
