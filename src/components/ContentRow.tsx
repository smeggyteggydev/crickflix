'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import ChannelCard from './ChannelCard';
import { ParsedM3UChannel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ContentRowProps {
    title: string;
    channels: ParsedM3UChannel[];
    onChannelSelect: (channel: ParsedM3UChannel) => void;
}

export default function ContentRow({ title, channels, onChannelSelect }: ContentRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.8
                : scrollLeft + clientWidth * 0.8;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setShowLeftArrow(e.currentTarget.scrollLeft > 50);
    };

    return (
        <div className="space-y-4 mb-20 relative group/row overflow-visible">
            <h3 className="text-2xl md:text-3xl font-black text-white px-8 md:px-16 tracking-tighter flex items-center gap-4">
                <span className="w-1.5 h-8 bg-brand-emerald rounded-full shadow-[0_0_15px_#00C853] block" />
                <span className="text-cinematic uppercase italic">{title}</span>
            </h3>

            <div className="relative overflow-visible px-8 md:px-16">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-16 z-[150] bg-black/60 hover:bg-black/80 backdrop-blur-md transition-all flex items-center justify-center text-white border-r border-white/5",
                        !showLeftArrow && "opacity-0 pointer-events-none"
                    )}
                >
                    <ChevronLeft size={48} strokeWidth={3} className="group-hover/row:scale-125 transition-transform" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 w-16 z-[150] bg-black/60 hover:bg-black/80 backdrop-blur-md transition-all flex items-center justify-center text-white border-l border-white/5 opacity-0 group-hover/row:opacity-100"
                >
                    <ChevronRight size={48} strokeWidth={3} className="group-hover/row:scale-125 transition-transform" />
                </button>

                {/* Edge Fades */}
                <div className="absolute left-16 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-[140] pointer-events-none" />
                <div className="absolute right-16 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-[140] pointer-events-none" />

                {/* Channels Scroll Container */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-6 overflow-x-auto no-scrollbar py-12 -my-12 overflow-y-visible"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {channels.map((channel, i) => (
                        <div key={channel.url + i} className="scroll-snap-align-start">
                            <ChannelCard
                                channel={channel}
                                onClick={() => onChannelSelect(channel)}
                            />
                        </div>
                    ))}

                    {/* View All Card */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex-none w-[200px] h-[160px] bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all self-center"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Plus size={20} className="text-white/40" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">View All</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
