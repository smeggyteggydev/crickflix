'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
            <div className="absolute inset-0 bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
                <svg
                    className="absolute h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="beam-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0,
                        }}
                        d="M -100 100 L 1100 -100"
                        stroke="url(#beam-gradient)"
                        strokeWidth="2"
                        fill="none"
                    />
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 2,
                        }}
                        d="M -200 400 L 1200 100"
                        stroke="url(#beam-gradient)"
                        strokeWidth="1"
                        fill="none"
                    />
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 1,
                        }}
                        d="M 1200 300 L -100 600"
                        stroke="url(#beam-gradient)"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </svg>
            </div>
        </div>
    );
};
