/**
 * Arithmos V3 — Tarot Reel Card
 * 
 * Individual slide for the vertical tarot mode.
 * Features: Cinematic animations, kinetic typography, and immersive visuals.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { type TarotReel } from "@/engines/tarot/reels-generator";

interface Props {
  reel: TarotReel;
  isActive: boolean;
}

export function TarotReelCard({ reel, isActive }: Props) {
  const card = reel.card;
  
  const getThemeColor = () => {
    switch (reel.vibe) {
      case "power": return "hsl(20, 90%, 65%)";
      case "warning": return "hsl(330, 80%, 60%)";
      case "love": return "hsl(310, 80%, 65%)";
      case "manifest": return "hsl(270, 80%, 70%)";
      default: return "hsl(260, 80%, 70%)";
    }
  };

  const getBaseFrequency = () => {
    switch (reel.vibe) {
      case "power": return 136.1; // OM frequency
      case "warning": return 528; // Repair frequency
      case "love": return 639; // Heart frequency
      case "manifest": return 852; // Third eye frequency
      default: return 432;
    }
  };

  const themeColor = getThemeColor();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let osc: OscillatorNode | null = null;
    let gain: GainNode | null = null;

    if (isActive) {
      const startAudio = async () => {
        if (!audioCtxRef.current) {
           audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        await audioCtxRef.current.resume();

        osc = audioCtxRef.current.createOscillator();
        gain = audioCtxRef.current.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(getBaseFrequency(), audioCtxRef.current.currentTime);
        
        gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        gain.gain.setTargetAtTime(0.05, audioCtxRef.current.currentTime, 1); // Subtle volume

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
      };
      
      // We only start if the user interacts (browsers block auto-play until interaction)
      // This will play when the user scrolls and touches the screen.
      startAudio().catch(() => {});
    }

    return () => {
      if (gain && audioCtxRef.current) {
         gain.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
         setTimeout(() => { if (osc) { osc.stop(); osc.disconnect(); } }, 500);
      }
    };
  }, [isActive, reel.vibe]);

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center p-6 bg-black">
      {/* Dynamic Ambient Glow */}
      <motion.div 
        animate={{ 
          scale: isActive ? [1, 1.2, 1] : 1,
          opacity: isActive ? [0.15, 0.3, 0.15] : 0 
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-[120px]"
        style={{ background: themeColor, width: "150%", height: "150%", left: "-25%", top: "-25%" }}
      />

      {/* Narrative Layer (Kinetic Top) */}
      <div className="relative z-10 w-full mb-12 text-center overflow-hidden">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs uppercase tracking-[0.3em] font-black mb-2 opacity-60"
          style={{ color: themeColor }}
        >
          Destino Instantáneo
        </motion.p>
        <motion.h3
          initial={{ y: 40, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl font-bold italic tracking-tighter text-white"
          style={{ fontFamily: "var(--cosm-font-display)" }}
        >
          {reel.hook}
        </motion.h3>
      </div>

      {/* Central Visual Card */}
      <motion.div
        initial={{ scale: 0.8, rotateY: 90, opacity: 0 }}
        animate={isActive ? { scale: 1, rotateY: 0, opacity: 1 } : {}}
        transition={{ delay: 0.7, type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 w-64 h-[420px] rounded-[32px] overflow-hidden p-1 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${themeColor}, transparent)`,
          boxShadow: `0 30px 60px -12px ${themeColor}44`,
        }}
      >
        <div className="w-full h-full rounded-[30px] bg-black/90 p-8 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Internal Glow Overlay */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          
          <div 
            className="text-8xl mt-12 mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            style={{ transform: card.reversed ? 'rotate(180deg)' : 'none' }}
          >
            {card.card.emoji}
          </div>

          <div className="text-center w-full">
            <h2 
              className="text-2xl font-black text-white leading-tight uppercase tracking-tight"
              style={{ fontFamily: "var(--cosm-font-display)" }}
            >
              {reel.title}
            </h2>
            <div className="h-px w-12 mx-auto my-4 bg-white/20"></div>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Arquetipo Universal</p>
          </div>
        </div>
      </motion.div>

      {/* Interpretation (Lower Third) */}
      <div className="relative z-10 w-full mt-12 px-2 text-center">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="text-base font-medium leading-snug text-white/90 max-w-[280px] mx-auto italic"
          style={{ fontFamily: "var(--cosm-font-body)" }}
        >
          "{reel.interpretation}"
        </motion.p>

        {/* Share Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ delay: 2, duration: 1 }}
          className="mt-12 flex justify-center gap-4"
        >
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white/60">
            Swipe Up 🪐
          </div>
        </motion.div>
      </div>

      {/* Vertical UI Sidebars (Simulating Tiktok UI) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20">
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xl">✨</div>
          <span className="text-[10px] font-bold text-white/60">Like</span>
        </button>
        <button 
           onClick={() => navigator.share?.({ title: 'Mensaje Cósmico', text: reel.interpretation, url: window.location.href })}
           className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xl">📤</div>
          <span className="text-[10px] font-bold text-white/60">Share</span>
        </button>
      </div>
    </div>
  );
}
