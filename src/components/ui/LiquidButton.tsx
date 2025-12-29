'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidButtonProps extends HTMLMotionProps<'button'> {
    children: React.ReactNode;
    variant?: 'primary' | 'glassy' | 'emerald' | 'prismatic' | 'chrome' | 'sphere';
    className?: string;
}

export default function LiquidButton({
    children,
    variant = 'primary',
    className,
    ...props
}: LiquidButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
                "relative group px-6 py-3 rounded-2xl font-bold transition-all duration-300 overflow-hidden",
                "flex items-center justify-center gap-2",
                (variant === 'primary' || variant === 'prismatic') && "bg-[#0A0A0A] prismatic-border",
                variant === 'glassy' && "glassy-core border border-white/5",
                variant === 'emerald' && "bg-brand-emerald text-black shadow-[0_0_20px_rgba(0,200,83,0.3)]",
                variant === 'chrome' && "bg-white text-black",
                variant === 'sphere' && "rounded-full aspect-square p-0 glassy-core border border-white/10",
                className
            )}
            {...props}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 glassy-core opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-12 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
        </motion.button>
    );
}
