'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    src: string;
    title?: string;
    onClose?: () => void;
    autoPlay?: boolean;
}

export default function VideoPlayer({ src, title, onClose, autoPlay = true }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        setIsLoading(true);
        setError(null);

        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 40,
                capLevelToPlayerSize: true,
                xhrSetup: (xhr, url) => {
                    xhr.withCredentials = false;
                }
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            // TRACKER for hanging - Android APK specific fix
            const nativeFallbackTimer = setTimeout(() => {
                if (isLoading) {
                    console.log('HLS.js hanging, triggering native fallback...');
                    hls.destroy();
                    video.src = src;
                    video.load();
                }
            }, 6000);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                clearTimeout(nativeFallbackTimer);
                setIsLoading(false);
                if (autoPlay) video.play().catch(e => console.error(e));
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    clearTimeout(nativeFallbackTimer);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            setIsLoading(false);
                            setError(`Stream issue: ${data.details}`);
                            hls.destroy();
                            break;
                    }
                }
            });

            return () => {
                clearTimeout(nativeFallbackTimer);
                if (hlsRef.current) hlsRef.current.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            const handleLoaded = () => setIsLoading(false);
            const handleError = () => {
                setIsLoading(false);
                setError('Native player failed to load stream.');
            };
            video.addEventListener('loadedmetadata', handleLoaded);
            video.addEventListener('error', handleError);
            return () => {
                video.removeEventListener('loadedmetadata', handleLoaded);
                video.removeEventListener('error', handleError);
            };
        }

        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [src, autoPlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        const container = videoRef.current?.parentElement;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    return (
        <div
            className="group relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                playsInline
            />

            {/* Premium Overlay Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10 pointer-events-none"
                    >
                        {/* Top Bar */}
                        <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between pointer-events-auto">
                            <div className="flex items-center gap-4">
                                <h3 className="text-white font-black tracking-tighter text-2xl uppercase italic">
                                    {title || 'Live Stream'}
                                </h3>
                                <div className="live-badge-premium">Live</div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Center Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                            {!isPlaying && !isLoading && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={togglePlay}
                                    className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 text-white shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                                >
                                    <Play size={48} fill="white" />
                                </motion.button>
                            )}
                        </div>

                        {/* Bottom Bar - THE PRISMATIC CONTROLS */}
                        <div className="absolute bottom-0 left-0 right-0 p-10 flex items-center gap-8 pointer-events-auto">
                            {/* Control Pill */}
                            <div className="flex items-center gap-6 bg-black/40 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-2xl relative overflow-hidden prismatic-border">
                                <button onClick={togglePlay} className="text-white hover:text-brand-emerald transition-colors">
                                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                                </button>

                                <div className="w-[1px] h-8 bg-white/10" />

                                <div className="flex items-center gap-4">
                                    <button onClick={toggleMute} className="text-white hover:text-brand-emerald transition-colors">
                                        {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.1"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value);
                                            setVolume(v);
                                            if (videoRef.current) videoRef.current.volume = v;
                                        }}
                                        className="w-28 h-1.5 bg-white/20 rounded-full appearance-none accent-brand-emerald"
                                    />
                                </div>

                                <div className="w-[1px] h-8 bg-white/10" />

                                <button onClick={toggleFullscreen} className="text-white hover:text-brand-emerald transition-colors">
                                    {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
                                </button>
                            </div>

                            <div className="flex-1" />

                            <button className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-xl text-white text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                                <Settings size={20} />
                                4K UHD • Auto
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black gap-6">
                    <div className="w-20 h-20 rounded-full border-t-2 border-r-2 border-brand-emerald animate-spin" />
                    <span className="text-white/40 text-xs font-black uppercase tracking-[0.4em] animate-pulse">
                        CricFlix • Initializing Ultra-HD Stream
                    </span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black p-10 text-center gap-8">
                    <div className="text-7xl animate-bounce">📡</div>
                    <div className="space-y-3">
                        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter">Stream Unstable</h3>
                        <p className="text-white/40 text-lg max-w-sm">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="prismatic-border px-12 py-4 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                        Try Reconnect
                    </button>
                </div>
            )}
        </div>
    );
}
