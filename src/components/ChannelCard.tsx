'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, ChevronDown, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParsedM3UChannel } from '@/lib/types';

interface ChannelCardProps {
    channel: ParsedM3UChannel;
    onClick: () => void;
}

export default function ChannelCard({ channel, onClick }: ChannelCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Clean channel name
    const cleanName = channel.name
        .replace(/^\|[A-Z]{2}\|?\s*/, '')
        .replace(/^[A-Z]{2}:\s*/, '')
        .replace(/\*+$/, '')
        .trim();

    return (
        <div
            className="relative flex-none w-[220px] md:w-[280px] h-[125px] md:h-[160px] cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <AnimatePresence>
                {!isHovered ? (
                    <motion.div
                        layoutId={`card-${channel.url}`}
                        className="w-full h-full bg-[#0d0d0d] rounded-xl overflow-hidden relative border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-white/30"
                    >
                        {/* Primary Visual: Logo */}
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-[#1a1a1a] to-black">
                            {channel.logo ? (
                                <img
                                    src={channel.logo}
                                    alt={channel.name}
                                    className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-brand-emerald/10 flex items-center justify-center border border-brand-emerald/20 group-hover:border-brand-emerald/40 transition-all">
                                    <Play className="text-brand-emerald translate-x-0.5" size={20} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Netflix-style bottom title bar */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                            <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{cleanName}</p>
                        </div>

                        {/* Live Badge - Emerald */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-sm border border-brand-emerald/30 shadow-[0_0_10px_rgba(0,200,83,0.3)]">
                            <div className="live-pulse" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Live</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        layoutId={`card-${channel.url}`}
                        initial={{ scale: 1 }}
                        animate={{
                            scale: 1.25,
                            y: -40,
                            zIndex: 100,
                            boxShadow: "0 40px 80px -15px rgba(0, 0, 0, 0.9)"
                        }}
                        exit={{ scale: 1, y: 0, zIndex: 10 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                        className="absolute top-0 left-0 w-full h-[260px] md:h-[300px] bg-[#000000] rounded-2xl overflow-hidden border border-white/20 prismatic-border liquid-metal-shine"
                    >
                        {/* Hover Preview Content */}
                        <div className="h-[120px] md:h-[150px] w-full bg-black relative">
                            {/* Backdrop with slight blur */}
                            <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center p-8">
                                {channel.logo ? (
                                    <img src={channel.logo} className="w-full h-full object-contain opacity-40 blur-[2px]" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-20" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />

                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <div className="live-pulse" />
                                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-2xl">Streaming 4K UHD</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <Volume2 size={16} className="text-white/80" />
                            </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-all shadow-xl"
                                >
                                    <Play size={20} fill="black" />
                                </motion.button>
                                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                                    <Plus size={20} />
                                </button>
                                <div className="flex-1" />
                                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-brand-emerald text-[11px] font-black uppercase tracking-tight">Ultra High Definition</span>
                                    <span className="px-1.5 py-0.5 text-[8px] bg-brand-emerald/10 text-brand-emerald rounded font-black border border-brand-emerald/20">PRO</span>
                                </div>
                                <h4 className="text-white text-lg font-black truncate leading-tight uppercase tracking-tighter">{cleanName}</h4>
                                <p className="text-white/40 text-[10px] font-bold leading-relaxed line-clamp-2 mt-2">
                                    {channel.groupTitle || 'LIVE SPORTS'} • Cinematic viewing with zero latency. Optimized for silver-grade servers.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
