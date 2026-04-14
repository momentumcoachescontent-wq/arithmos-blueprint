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

  if (!myProfile) return null;

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

              <div className="p-4 rounded-xl text-xs leading-relaxed" style={{ background: "hsla(260 40% 8% / 0.8)", border: "1px solid hsla(270 40% 40% / 0.3)", color: "hsl(0 0% 90%)" }}>
                {selectedMatch.result.advice}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
