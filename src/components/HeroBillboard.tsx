'use client';

import React from 'react';
import { Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidButton from './ui/LiquidButton';
import { BackgroundBeams } from './ui/BackgroundBeams';

export default function HeroBillboard() {
    return (
        <div className="relative h-screen w-full flex items-center justify-start overflow-hidden bg-black">
            {/* Background Container */}
            <div className="absolute inset-0 z-0">
                {/* Netflix-style Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent z-10" />

                {/* Hero Mask (Seamless transition to rows) */}
                <div className="absolute bottom-0 left-0 right-0 h-[40vh] hero-mask z-20" />

                <div className="w-full h-full bg-[#050505] relative overflow-hidden">
                    <BackgroundBeams className="opacity-40" />

                    {/* Auto-playing Cinematic Video Loop */}
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
                        poster="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2163&auto=format&fit=crop"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-stadium-lights-shining-in-the-night-4284-large.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            {/* Hero Content Overlay */}
            <div className="relative z-30 px-8 md:px-24 w-full h-full flex flex-col justify-center">
                <div className="max-w-4xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-brand-emerald text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm live-badge-premium shadow-[0_0_15px_rgba(0,200,83,0.3)]">
                                Live Now
                            </div>
                            <span className="text-white/60 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">ICC CHAMPIONS TROPHY 2025</span>
                        </div>

                        <h1 className="text-4xl md:text-9xl font-black tracking-tighter leading-[0.8] text-cinematic drop-shadow-2xl">
                            IND <span className="text-brand-emerald">VS</span> PAK
                        </h1>

                        <p className="text-base md:text-2xl text-white/50 max-w-xl font-medium leading-relaxed">
                            Watch the high-stakes battle as arch-rivals collide in the ultimate showdown.
                            Experience every moment in cinematic <span className="text-white">4K UHD</span> quality.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pt-6 w-full sm:w-auto"
                    >
                        <LiquidButton
                            variant="emerald"
                            className="px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl w-full sm:min-w-[200px]"
                        >
                            <Play fill="currentColor" size={24} className="mr-3" />
                            Watch Now
                        </LiquidButton>

                        <LiquidButton
                            variant="glassy"
                            className="px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl w-full sm:min-w-[200px]"
                        >
                            <Info size={24} className="mr-3" />
                            More Info
                        </LiquidButton>
                    </motion.div>
                </div>
            </div>

            {/* Visual Flair: Liquid Orbs */}
            <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
        </div>
    );
}
