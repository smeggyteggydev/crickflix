'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HeroBillboard from '@/components/HeroBillboard';
import ContentRow from '@/components/ContentRow';
import VideoPlayer from '@/components/VideoPlayer';
import Marquee from '@/components/Marquee';
import { ParsedM3UChannel } from '@/lib/types';

// CONFIGURATION: Internal Next.js API proxy for Vercel hosting.
const PROXY_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? "/api/proxy?url="
  : "";

export default function Home() {
  const [channels, setChannels] = useState<ParsedM3UChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<ParsedM3UChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // M3U Parsing Logic (Kept intact from stable version)
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/sports_channels.m3u');
        if (!response.ok) throw new Error('Failed to load channels');
        const data = await response.text();
        const parsed = parseM3U(data);
        setChannels(parsed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const parseM3U = (data: string): ParsedM3UChannel[] => {
    const lines = data.split('\n');
    const result: ParsedM3UChannel[] = [];
    let currentChannel: Partial<ParsedM3UChannel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF')) {
        const info = line.split(',');
        const name = info[info.length - 1].trim();
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);

        currentChannel = {
          name,
          logo: logoMatch ? logoMatch[1] : undefined,
          groupTitle: groupMatch ? groupMatch[1] : 'Live Sports',
        };
      } else if (line.startsWith('http')) {
        currentChannel.url = line;
        if (currentChannel.name && currentChannel.url) {
          result.push(currentChannel as ParsedM3UChannel);
        }
        currentChannel = {};
      }
    }
    return result;
  };

  // Category filtering for rows
  const rows = useMemo(() => {
    if (channels.length === 0) return [];

    // Custom "Netflix" categories
    const liveNow = channels.filter(c => c.name.toLowerCase().includes('sports') || c.name.toLowerCase().includes('live')).slice(0, 20);
    const cricketSpecial = channels.filter(c => c.name.toLowerCase().includes('cricket') || c.name.toLowerCase().includes('ptv')).slice(0, 20);
    const premiumSports = channels.slice(40, 60);
    const international = channels.filter(c => (c.name.toLowerCase().includes('sky') || c.name.toLowerCase().includes('fox')) && !c.name.toLowerCase().includes('cricket')).slice(0, 20);

    return [
      { title: '🔴 Live Now: Global Sports', channels: liveNow },
      { title: '🏏 Cricket Fever: T20 & Test', channels: cricketSpecial },
      { title: '🏅 Premium Tournament Channels', channels: premiumSports },
      { title: '🌍 International Highlights', channels: international },
    ];
  }, [channels]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-emerald/30">
      <Navbar />

      <AnimatePresence>
        {isMounted && !selectedChannel ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-20"
          >
            <HeroBillboard />

            <div className="relative z-40 -mt-56 space-y-12">
              <Marquee text={[
                "LIVE: IND 245/4 (42.2) vs PAK • Next Match: AUS vs ENG (Highlights)",
                "BREAKING: Kohli smashes 50th ODI century • CricFlix 4K streaming stable",
                "UPCOMING: IPL 2025 Auctions starting next week • Watch Live on Server 1",
                "TECH: Prismatic Streaming Engine enabled for all cricket channels"
              ]} />

              <div className="pt-10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-12 h-12 border-t-2 border-brand-emerald rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Syncing with Global Satellites...
                    </span>
                  </div>
                ) : (
                  rows.map((row, idx) => (
                    <ContentRow
                      key={idx}
                      title={row.title}
                      channels={row.channels}
                      onChannelSelect={setSelectedChannel}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : selectedChannel && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[2000] bg-black"
          >
            <VideoPlayer
              src={PROXY_URL ? `${PROXY_URL}${btoa(selectedChannel.url)}` : selectedChannel.url}
              title={selectedChannel.name}
              onClose={() => setSelectedChannel(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-20 border-t border-white/5 bg-black flex flex-col items-center gap-6">
        <img src="/logo.png" alt="CricFlix" className="h-8 opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">
          © 2025 CRICFLIX • PREMIUM STREAMING
        </p>
      </footer>
    </main>
  );
}
