'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={cn(
            "fixed top-0 w-full z-[1000] transition-all duration-500 px-8 md:px-16 py-4 flex items-center justify-between",
            isScrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/5 py-3" : "bg-gradient-to-b from-black/80 to-transparent"
        )}>
            {/* Left Section: Logo & Links */}
            <div className="flex items-center gap-10">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-32 h-10 cursor-pointer"
                >
                    <img
                        src="/logo.png"
                        alt="CricFlix"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,200,83,0.3)]"
                    />
                </motion.div>

                <div className="hidden lg:flex items-center gap-6">
                    {['Home', 'Live', 'Tournaments', 'Highlights', 'My List'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-tight"
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-6">
                <button className="text-white/80 hover:text-white transition-colors">
                    <Search size={22} />
                </button>
                <button className="relative text-white/80 hover:text-white transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border border-black shadow-[0_0_8px_white]" />
                </button>
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] border border-white/20 flex items-center justify-center shadow-lg">
                        <User size={18} className="text-white/80" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white/60">Pro</span>
                </div>
                <button className="lg:hidden text-white">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
}
