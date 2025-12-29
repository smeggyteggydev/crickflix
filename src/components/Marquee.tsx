'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ text }: { text: string[] }) => {
    return (
        <div className="w-full bg-brand-emerald/5 border-b border-white/5 py-3 overflow-hidden whitespace-nowrap z-40 relative">
            <motion.div
                animate={{ x: [0, -1000] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 40,
                        ease: "linear",
                    },
                }}
                className="flex gap-16 items-center"
            >
                {text.map((item, i) => (
                    <span key={i} className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald live-pulse" />
                        {item}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {text.map((item, i) => (
                    <span key={`dup-${i}`} className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald live-pulse" />
                        {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default Marquee;
