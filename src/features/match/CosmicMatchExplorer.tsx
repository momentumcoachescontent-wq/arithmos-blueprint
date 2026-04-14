/**
 * Arithmos V3 — Cosmic Match Explorer
 *
 * Muestra la cuadrícula estilo galería de los usuarios compatibles y
 * permite abrir el detalle de compatibilidad (Modal).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateCompatibility, type CompatibilityResult } from "@/engines/compatibility/sinastry";
import { useProfile, ARCHETYPES } from "@/hooks/useProfile";
import { CosmicCard } from "@/ui/CosmicCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchProfile {
  user_id: string;
  name: string;
  bio: string | null;
  life_path_number: number;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  birth_date: string;
}

interface Props {
  matches: MatchProfile[];
}

export function CosmicMatchExplorer({ matches }: Props) {
  const { profile: myProfile } = useProfile();
  const [selectedMatch, setSelectedMatch] = useState<{
    profile: MatchProfile;
    result: CompatibilityResult;
  } | null>(null);

  const [sendingVibe, setSendingVibe] = useState(false);
  const [matchResult, setMatchResult] = useState<boolean | null>(null);

  if (!myProfile) return null;

  const handleSendVibe = async () => {
    if (!selectedMatch || sendingVibe) return;
    setSendingVibe(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-interaction", {
        body: { targetUserId: selectedMatch.profile.user_id }
      });

      if (error) throw error;
      
      if (data.match) {
        setMatchResult(true);
      } else {
        toast.success(`Vibración enviada a ${selectedMatch.profile.name} ✨`);
        setSelectedMatch(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al enviar vibración");
    } finally {
      setSendingVibe(false);
    }
  };

  const handleSelect = (m: MatchProfile) => {
    // Calculamos la sinastría usando el engine real
    const compData = calculateCompatibility(
      { lifePath: myProfile.lifePathNumber, sunSign: myProfile.sunSign || "Aries", name: myProfile.name },
      { lifePath: m.life_path_number, sunSign: m.sun_sign || "Aries", name: m.name }
    );

    setSelectedMatch({ profile: m, result: compData });
  };

  return (
    <div className="space-y-6">
      {/* Grid de Exploración */}
      <div className="grid grid-cols-2 gap-3">
        {matches.map((m) => (
          <motion.button
            key={m.user_id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(m)}
            className="text-left rounded-2xl overflow-hidden relative"
            style={{
              background: "hsla(260 30% 15% / 0.8)",
              border: "1px solid hsla(270 50% 30% / 0.5)",
              minHeight: "160px",
            }}
          >
            {/* Vibe badge background gradient based on element would be cool, but we use a standard one for now */}
            <div className="absolute inset-0 opacity-20" style={{
              background: `linear-gradient(135deg, hsl(${m.life_path_number * 30} 80% 50%), transparent)`
            }}></div>
            
            <div className="p-3 relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: "linear-gradient(135deg, hsl(270 80% 65%), hsl(310 80% 60%))",
                    color: "white",
                  }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] uppercase font-bold" style={{ color: "hsl(270 80% 70%)" }}>
                  {m.sun_sign?.substring(0, 3) || "—"} ☀️
                </span>
              </div>
              
              <div className="mt-auto">
                <h3 className="font-bold text-white text-sm truncate">{m.name}</h3>
                <p className="text-[10px] truncate" style={{ color: "hsl(260 10% 60%)" }}>
                  Camino {m.life_path_number} • {ARCHETYPES[m.life_path_number]?.name.split(" ")[1] || "Músico"}
                </p>
                {m.bio && (
                  <p className="text-[10px] mt-1 italic line-clamp-2" style={{ color: "hsl(260 30% 80%)" }}>
                    "{m.bio}"
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Modal de Detalle (Reading) */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[32px] overflow-hidden p-6 relative"
              style={{
                background: "linear-gradient(180deg, hsl(260 40% 12%) 0%, hsl(260 50% 6%) 100%)",
                border: "1px solid hsla(270 50% 30% / 0.5)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white"
              >
                ✕
              </button>

              <div className="text-center mb-6 mt-4">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg bg-white/10 text-white">
                    {myProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-2xl">✨</span>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: "linear-gradient(135deg, hsl(270 80% 65%), hsl(310 80% 60%))", color: "white" }}>
                    {selectedMatch.profile.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "var(--cosm-font-display)" }}>
                  {selectedMatch.result.score}%
                </h2>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "hsla(15 90% 20% / 0.4)", color: "hsl(15 90% 65%)" }}>
                  {selectedMatch.result.vibe}
                </div>
              </div>

              {/* Bio block if any */}
              {selectedMatch.profile.bio && (
                <div className="mb-6 p-3 rounded-xl text-sm italic text-center" style={{ background: "black", color: "hsl(260 20% 70%)" }}>
                  "{selectedMatch.profile.bio}"
                </div>
              )}

              {/* Fluidez y Friccion */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-left p-3 rounded-xl" style={{ background: "hsla(145 60% 10% / 0.5)", border: "1px solid hsla(145 60% 40% / 0.2)" }}>
                  <h4 className="text-[10px] uppercase font-bold text-green-400 mb-2">Fluidez</h4>
                  <ul className="text-[10px] space-y-1" style={{ color: "hsl(145 30% 70%)" }}>
                    {selectedMatch.result.strengths.slice(0, 2).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="text-left p-3 rounded-xl" style={{ background: "hsla(310 60% 10% / 0.5)", border: "1px solid hsla(310 60% 40% / 0.2)" }}>
                  <h4 className="text-[10px] uppercase font-bold text-pink-400 mb-2">Fricción</h4>
                  <ul className="text-[10px] space-y-1" style={{ color: "hsl(310 30% 70%)" }}>
                    {selectedMatch.result.challenges.slice(0, 2).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendVibe}
                  disabled={sendingVibe}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, hsl(310 80% 55%), hsl(15 90% 60%))", color: "white", fontFamily: "var(--cosm-font-display)" }}
                >
                  {sendingVibe ? "Sintonizando..." : "Enviar Vibe 💖"}
                </motion.button>
              </div>

              <div className="p-4 rounded-xl text-xs leading-relaxed" style={{ background: "hsla(260 40% 8% / 0.8)", border: "1px solid hsla(270 40% 40% / 0.3)", color: "hsl(0 0% 90%)" }}>
                {selectedMatch.result.advice}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DISRUPTIVO DE MATCH */}
      <AnimatePresence>
        {matchResult && selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-8"
              >
                💞
              </motion.div>
              <h2 
                className="text-4xl font-black italic mb-2 tracking-tighter"
                style={{ fontFamily: "var(--cosm-font-display)", color: "white" }}
              >
                COSMIC MATCH
              </h2>
              <p className="text-pink-400 font-bold uppercase tracking-widest text-sm mb-10">
                Tus astros han colisionado
              </p>

              <div className="flex justify-center gap-6 mb-12">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center text-3xl font-black">
                    {myProfile.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-pink-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold">TÚ</div>
                </div>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-pink-500 overflow-hidden bg-pink-500/20 flex items-center justify-center text-3xl font-black">
                    {selectedMatch.profile.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-pink-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold">{selectedMatch.raw?.score || selectedMatch.result.score}%</div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMatchResult(null);
                  setSelectedMatch(null);
                }}
                className="px-10 py-4 rounded-full font-black text-black bg-white uppercase tracking-widest text-xs"
              >
                Seguir Explorando
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
