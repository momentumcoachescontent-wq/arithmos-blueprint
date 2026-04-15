/**
 * Arithmos V3 — Tarot Reels View
 * 
 * Full-screen vertical scrolling experience for Tarot Readings.
 * Uses snap-scroll for mobile-native feel.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateDailyReels, type TarotReel } from "@/engines/tarot/reels-generator";
import { TarotReelCard } from "./TarotReelCard";

export default function TarotReelsView() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Generamos un set diario (memoizado)
  const reels = useMemo(() => generateDailyReels(10), []);

  useEffect(() => {
    // Ocultar el scrollbar global para máxima inmersión
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-[100dvh]">
      {/* Header Overlays */}
      <div className="absolute top-12 left-6 z-[60] flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
        >
          ←
        </button>
        <span 
          className="text-xs font-black tracking-widest text-white/40 uppercase"
        >
          Reel {activeIndex + 1}/{reels.length}
        </span>
      </div>

      {/* Snap Scroll Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide no-scrollbar"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth'
        }}
      >
        {reels.map((reel, idx) => {
          const distance = Math.abs(activeIndex - idx);
          return (
            <motion.div 
              key={reel.id} 
              animate={{ 
                scale: distance === 0 ? 1 : 0.85,
                opacity: distance === 0 ? 1 : 0.3,
                filter: distance === 0 ? "blur(0px)" : "blur(4px)"
              }}
              className="h-full w-full snap-start snap-always"
            >
              <TarotReelCard reel={reel} isActive={activeIndex === idx} />
            </motion.div>
          );
        })}
      </div>

      {/* Progress Indicator (Liquid style) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-[60]">
        {reels.map((_, idx) => (
          <motion.div
            key={idx}
            animate={{ 
              height: activeIndex === idx ? 20 : 4,
              opacity: activeIndex === idx ? 1 : 0.3,
            }}
            className="w-1 rounded-full bg-white"
          />
        ))}
      </div>
    </div>
  );
}
