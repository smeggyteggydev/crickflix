'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'card' | 'text' | 'avatar' | 'button';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({ className = '', variant = 'card', width, height }: SkeletonProps) {
    const baseStyles: React.CSSProperties = {
        width: width || '100%',
        height: height || '100%',
    };

    const variants = {
        card: { height: height || '200px', borderRadius: '16px' },
        text: { height: height || '16px', borderRadius: '8px' },
        avatar: { width: width || '48px', height: height || '48px', borderRadius: '50%' },
        button: { width: width || '120px', height: height || '44px', borderRadius: '12px' },
    };

    return (
        <div
            className={`skeleton ${className}`}
            style={{ ...baseStyles, ...variants[variant] }}
        />
    );
}

export function ChannelCardSkeleton() {
    return (
        <div
            className="channel-card flex-shrink-0"
            style={{ width: '280px', height: '180px', padding: '20px' }}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-start gap-4">
                    <Skeleton variant="avatar" width={60} height={60} />
                    <div className="flex-1">
                        <Skeleton variant="text" height={20} className="mb-2" />
                        <Skeleton variant="text" height={14} width="60%" />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <Skeleton variant="text" width={80} height={28} />
                    <Skeleton variant="button" width={40} height={40} />
                </div>
            </div>
        </div>
    );
}

export function ContentRowSkeleton() {
    return (
        <div className="content-row">
            <Skeleton variant="text" width={200} height={28} className="mb-5" />
            <div className="content-row-scroll">
                {[...Array(6)].map((_, i) => (
                    <ChannelCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="hero">
            <div className="hero-content">
                <Skeleton variant="button" width={150} height={36} className="mb-6" />
                <Skeleton variant="text" width="80%" height={60} className="mb-4" />
                <Skeleton variant="text" width="60%" height={60} className="mb-6" />
                <div className="flex flex-col gap-2" style={{ maxWidth: '550px' }}>
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" width="70%" height={20} />
                </div>
                <div className="flex gap-4 mt-8">
                    <Skeleton variant="button" width={160} height={52} />
                    <Skeleton variant="button" width={160} height={52} />
                </div>
            </div>
        </div>
    );
}
