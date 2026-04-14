/**
 * Arithmos V3 — Cosmic Compatibility
 *
 * Vista para calcular y visualizar la sinastría (compatibilidad) con otra persona.
 * MVP: Muestra el Big Three y Camino de Vida de ambos, y genera un "Alignment Score".
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, calculateLifePath, ARCHETYPES } from "@/hooks/useProfile";
import { calculateNatalProfile } from "@/engines/astrology/natal-chart";
import { calculateCompatibility, type CompatibilityResult } from "@/engines/compatibility/sinastry";
import { CosmicShell } from "@/ui/CosmicShell";

export default function CosmicCompatibility() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [partnerName, setPartnerName] = useState("");
  const [partnerDate, setPartnerDate] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ raw: CompatibilityResult; partner: any } | null>(null);

  const shareResult = async () => {
    if (!result) return;
    const text = `🌌 Mi sinastría con ${result.partner.name} es ${result.raw.score}% (${result.raw.vibe}) según Arithmos.\n\nNuestra misión cósmica:\n${result.raw.advice.substring(0, 80)}...\n\nCalcula la tuya en app.arithmos.mx ✨`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Sinastría Arithmos",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("¡Copiado al portapapeles!");
      }
    } catch (e) {
      console.log("Share cancelled or failed", e);
    }
  };

  const handleCompatibilityCalc = () => {
    if (!partnerName.trim() || partnerDate.length !== 10) return;
    setAnalyzing(true);

    setTimeout(() => {
      const partnerLifePath = calculateLifePath(partnerDate);
      const partnerArchetype = ARCHETYPES[partnerLifePath] || ARCHETYPES[1];
      const partnerNatal = calculateNatalProfile({ date: partnerDate });

      const personANatal = calculateNatalProfile({ date: profile.birthDate });

      const compData = calculateCompatibility(
        { lifePath: profile.lifePathNumber, sunSign: personANatal.sunSign.nameEs, name: profile.name },
        { lifePath: partnerLifePath, sunSign: partnerNatal.sunSign.nameEs, name: partnerName }
      );

      setResult({
        partner: {
          name: partnerName,
          lifePath: partnerLifePath,
          archetype: partnerArchetype.name,
          sun: partnerNatal.sunSign.nameEs,
          moon: partnerNatal.moonSign.nameEs,
          rising: partnerNatal.risingSign.nameEs,
        },
        raw: compData,
      });

      setAnalyzing(false);
    }, 2000);
  };

  if (!user || !profile) return null;

  return (
    <CosmicShell particles particlePalette="violet">
      <div className="pb-24 min-h-screen px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-2xl"
            style={{ color: "hsl(260 10% 60%)" }}
          >
            ←
          </button>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
            >
              Sinastría
            </h1>
            <p
              className="text-xs"
              style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(270 60% 65%)" }}
            >
              ¿Qué dice el universo de ustedes dos?
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Profile A (User) */}
              <div
                className="p-4 rounded-2xl flex items-center gap-4"
                style={{
                  background: "hsla(260 40% 12% / 0.5)",
                  border: "1px solid hsla(270 40% 40% / 0.3)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    background: "linear-gradient(135deg, hsl(270 80% 65%), hsl(310 80% 60%))",
                    fontFamily: "var(--cosm-font-display)",
                    color: "hsl(0 0% 98%)",
                  }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{profile.name}</h3>
                  <p className="text-xs" style={{ color: "hsl(270 40% 65%)" }}>
                    Tú
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "hsl(260 10% 60%)" }}>
                    La otra persona
                  </label>
                  <input
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Su nombre"
                    className="w-full px-4 py-3 rounded-xl mb-3"
                    style={{
                      background: "hsla(260 40% 8% / 0.8)",
                      border: "1px solid hsla(270 60% 40% / 0.4)",
                      color: "hsl(0 0% 95%)",
                      outline: "none",
                    }}
                  />
                  <input
                    type="date"
                    value={partnerDate}
                    onChange={(e) => setPartnerDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: "hsla(260 40% 8% / 0.8)",
                      border: "1px solid hsla(270 60% 40% / 0.4)",
                      color: "hsl(0 0% 95%)",
                      outline: "none",
                    }}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCompatibilityCalc}
                  disabled={analyzing || !partnerName.trim() || partnerDate.length !== 10}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center"
                  style={{
                    background:
                      partnerName && partnerDate.length === 10
                        ? "linear-gradient(135deg, hsl(310 80% 55%), hsl(15 90% 60%))"
                        : "hsla(260 20% 20% / 0.5)",
                    color: "white",
                    fontFamily: "var(--cosm-font-display)",
                    border: "none",
                  }}
                >
                  {analyzing ? "Calculando órbitas..." : "Alinear astros ✨"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              {/* Score ring */}
              <div
                className="w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center p-2 mb-6"
                style={{
                  background: "radial-gradient(circle, hsla(310 80% 20% / 0.6) 0%, hsla(260 80% 10% / 0) 70%)",
                  border: "2px solid hsla(310 80% 60% / 0.5)",
                  boxShadow: "0 0 40px hsla(310 80% 60% / 0.3)",
                }}
              >
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 98%)" }}
                >
                  {result.raw.score}%
                </span>
                <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "hsl(310 50% 60%)" }}>
                  Alineación
                </span>
              </div>

              {/* Vibe label */}
              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
                style={{
                  background: "hsla(15 90% 20% / 0.4)",
                  color: "hsl(15 90% 65%)",
                  border: "1px solid hsla(15 90% 40% / 0.4)",
                }}
              >
                {result.raw.vibe}
              </div>

              {/* Strengths & Challenges */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-left p-3 rounded-xl" style={{ background: "hsla(145 60% 10% / 0.5)", border: "1px solid hsla(145 60% 40% / 0.2)" }}>
                  <h4 className="text-[10px] uppercase font-bold text-green-400 mb-2">Fluidez</h4>
                  <ul className="text-xs space-y-1.5" style={{ color: "hsl(145 30% 70%)" }}>
                    {result.raw.strengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="text-left p-3 rounded-xl" style={{ background: "hsla(310 60% 10% / 0.5)", border: "1px solid hsla(310 60% 40% / 0.2)" }}>
                  <h4 className="text-[10px] uppercase font-bold text-pink-400 mb-2">Fricción</h4>
                  <ul className="text-xs space-y-1.5" style={{ color: "hsl(310 30% 70%)" }}>
                    {result.raw.challenges.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              </div>

              {/* Coach message */}
              <div
                className="p-5 rounded-2xl text-left"
                style={{
                  background: "hsla(260 40% 12% / 0.6)",
                  border: "1px solid hsla(270 40% 40% / 0.3)",
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 90%)", fontFamily: "var(--cosm-font-body)" }}>
                  {result.raw.advice}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={shareResult}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "hsl(270 80% 65%)", color: "white", fontFamily: "var(--cosm-font-display)" }}
                >
                  Compartir 💌
                </motion.button>
              </div>

              <button
                onClick={() => setResult(null)}
                className="text-xs decoration-white underline mt-4 block mx-auto"
                style={{ color: "hsl(260 10% 60%)" }}
              >
                Analizar otra conexión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CosmicShell>
  );
}
