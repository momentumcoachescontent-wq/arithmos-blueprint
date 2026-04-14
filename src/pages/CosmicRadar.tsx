/**
 * Arithmos V3 — Cosmic Radar Page
 *
 * Página orquestadora del Tinder Cósmico.
 * 1. Muestra opt-in si no eres público.
 * 2. Si eres público, carga matches desde Edge Function.
 * 3. Renderiza CosmicMatchExplorer.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { CosmicShell } from "@/ui/CosmicShell";
import { CosmicMatchExplorer } from "@/features/match/CosmicMatchExplorer";
import { toast } from "sonner";

export default function CosmicRadar() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile, fetchProfile } = useProfile();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [bioInput, setBioInput] = useState("");
  const [savingOptIn, setSavingOptIn] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.isPublic) {
      loadMatches();
    } else {
      setLoading(false);
    }
  }, [profile?.isPublic]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("find-matches");
      if (error) throw error;
      setMatches(data.matches || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Error al sintonizar el radar cósmico");
    } finally {
      setLoading(false);
    }
  };

  const handleOptIn = async () => {
    if (!profile || !session) return;
    setSavingOptIn(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_public: true,
          bio: bioInput.trim() || null,
        })
        .eq("user_id", profile.userId);

      if (error) throw error;
      
      // Update local profile state via fetch
      await fetchProfile(profile.userId);
      toast.success("¡Faro cósmico encendido! Estás en el radar.");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo encender el radar");
    } finally {
      setSavingOptIn(false);
    }
  };

  if (!profile) return null;

  return (
    <CosmicShell particles particlePalette="violet">
      <div className="pb-24 min-h-screen px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-2xl" style={{ color: "hsl(260 10% 60%)" }}>←</button>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}>
                Radar Cósmico
              </h1>
              <p className="text-xs" style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(270 60% 65%)" }}>
                Conecta con tu tribu
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          {profile.isPublic && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "hsla(145 60% 10% / 0.5)", border: "1px solid hsla(145 60% 40% / 0.3)" }}>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_hsl(145,100%,50%)] animate-pulse"></div>
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Visible</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-t-white border-white/20 rounded-full animate-spin"></div>
            </motion.div>
          ) : !profile.isPublic ? (
            <motion.div key="optin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="p-6 rounded-3xl text-center" style={{ background: "hsla(260 40% 12% / 0.5)", border: "1px solid hsla(270 40% 40% / 0.3)" }}>
                <div className="text-5xl mb-4">📡</div>
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--cosm-font-display)" }}>
                  Enciende tu Radar
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(260 10% 70%)" }}>
                  Para explorar la sinastría con otros usuarios, primero debes ser visible para ellos. ¿Te atreves a conectar tus astros?
                </p>

                <div className="text-left space-y-2 mb-6">
                  <label className="text-xs uppercase tracking-widest font-bold" style={{ color: "hsl(270 50% 60%)" }}>Tu Bio (Opcional)</label>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Escribe tu vibe en una frase..."
                    className="w-full p-4 rounded-xl resize-none text-sm"
                    maxLength={140}
                    rows={3}
                    style={{ background: "hsla(0 0% 0% / 0.3)", border: "1px solid hsla(270 50% 30% / 0.5)", color: "white", outline: "none" }}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOptIn}
                  disabled={savingOptIn}
                  className="w-full py-4 rounded-xl font-bold"
                  style={{ background: "linear-gradient(135deg, hsl(270 80% 65%), hsl(310 80% 60%))", color: "white", fontFamily: "var(--cosm-font-display)" }}
                >
                  {savingOptIn ? "Conectando..." : "Hacerme Público ✨"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {matches.length === 0 ? (
                <div className="text-center py-20 p-6 rounded-3xl" style={{ border: "1px dashed hsla(270 40% 40% / 0.5)" }}>
                  <div className="text-4xl mb-4">🌌</div>
                  <p className="text-sm" style={{ color: "hsl(260 10% 60%)" }}>El cosmos está un poco callado en este momento. Vuelve más tarde.</p>
                </div>
              ) : (
                <CosmicMatchExplorer matches={matches} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CosmicShell>
  );
}
