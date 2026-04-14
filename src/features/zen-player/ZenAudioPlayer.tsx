import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ZenAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const togglePlay = async () => {
    if (isPlaying) {
      // Stop Audio
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
          }
          setIsPlaying(false);
        }, 500);
      } else {
        setIsPlaying(false);
      }
    } else {
      // Start 432Hz Healing Frequency (Solfeggio)
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      await audioCtxRef.current.resume();

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(432, audioCtxRef.current.currentTime); // 432Hz
      
      gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      gain.gain.setTargetAtTime(0.15, audioCtxRef.current.currentTime, 2); // Fade in gracefully

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 shadow-2xl relative overflow-hidden">
      {/* Dynamic Glow when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-emerald-500/20 blur-xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <button 
        onClick={togglePlay}
        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
      >
        {isPlaying ? (
          <div className="w-4 h-4 bg-white rounded-sm" />
        ) : (
          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
        )}
      </button>

      <div className="relative z-10 flex-1">
        <h4 className="text-sm font-bold text-white tracking-widest uppercase font-serif">432 Hz</h4>
        <p className="text-[10px] text-white/50 uppercase tracking-widest">Frecuencia de Sanación</p>
        
        {/* Visualizer bars placeholder */}
        <div className="flex gap-1 h-3 mt-2 items-end">
          {[1,2,3,4,5,6,7, 8, 9, 10].map(i => (
            <motion.div 
              key={i}
              animate={isPlaying ? { height: ["20%", "100%", "30%"] } : { height: "20%" }}
              transition={{ 
                duration: 0.8 + (i % 3) * 0.2, 
                repeat: isPlaying ? Infinity : 0,
                repeatType: "mirror"
              }}
              className="w-1 bg-white/40 rounded-t-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
