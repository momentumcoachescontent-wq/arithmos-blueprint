/**
 * Arithmos V3 — Tarot Reel Card
 * 
 * Individual slide for the vertical tarot mode.
 * Features: Cinematic animations, kinetic typography, and immersive visuals.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { type TarotReel } from "@/engines/tarot/reels-generator";

interface Props {
  reel: TarotReel;
  isActive: boolean;
}

export function TarotReelCard({ reel, isActive }: Props) {
  const { user } = useAuth();
  const [hasLiked, setHasLiked] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
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
    // Reset like state when reel changes or is initialized
    setHasLiked(false);
  }, [reel.id]);

  const handleLike = async () => {
    if (!user || hasLiked) return;
    
    setHasLiked(true);
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 1000);

    try {
      // Registrar interacción en Supabase (V5 Schema)
      // Nota: receiver_id debería ser el autor del contenido, pero por ahora 
      // lo registramos como una interacción global o con un bot si no hay autor.
      const { error } = await supabase
        .from('cosmic_interactions')
        .insert({
          sender_id: user.id,
          receiver_id: '00000000-0000-0000-0000-000000000000', // System account for global reels
          is_mutual: false
        });
      
      if (error && error.code !== '23505') { // Ignorar duplicados
        console.error("Error al registrar vibración:", error);
      }
    } catch (err) {
      console.error("Error interactuando con el cosmos:", err);
    }
  };

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
          Tu Mensaje de Hoy
        </motion.p>
        <motion.h3
          initial={{ y: 40, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl font-bold italic tracking-tighter text-white px-4"
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
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Tu Esencia</p>
          </div>
        </div>

        {/* Heart Pop Animation Overlay */}
        <AnimatePresence>
          {showHeartPop && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1.2], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <Heart size={120} fill="white" className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>
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
          <div className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold tracking-[0.2em] text-white/80">
            Desliza para más 🪐
          </div>
        </motion.div>
      </div>

      {/* Vertical UI Sidebars (Action Buttons) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-8 z-20">
        <button 
          onClick={handleLike}
          className="flex flex-col items-center gap-1.5 group"
        >
          <motion.div 
            whileTap={{ scale: 0.8 }}
            className={`w-14 h-14 rounded-full backdrop-blur-xl flex items-center justify-center text-xl transition-all duration-300 ${hasLiked ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/10 group-hover:bg-white/20'}`}
          >
            <Heart size={24} fill={hasLiked ? "black" : "none"} strokeWidth={2.5} />
          </motion.div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${hasLiked ? 'text-white' : 'text-white/40'}`}>
            {hasLiked ? 'Vibrado' : 'Vibra'}
          </span>
        </button>
        
        <button 
           onClick={() => navigator.share?.({ title: 'Mensaje Cósmico', text: reel.interpretation, url: window.location.href })}
           className="flex flex-col items-center gap-1.5 group"
        >
          <motion.div 
            whileTap={{ scale: 0.8 }}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-xl transition-all group-hover:bg-white/20"
          >
            <Share2 size={24} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Compartir</span>
        </button>
      </div>

      {/* Portal Attribution Legend */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none opacity-30">
        <p className="text-[9px] uppercase tracking-[0.4em] font-medium text-white/60">
          arithmos-blueprint.lovable.app
        </p>
      </div>
    </div>
  );
}
