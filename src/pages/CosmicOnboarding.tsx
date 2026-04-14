/**
 * Arithmos V3 — Cosmic Onboarding
 *
 * Flujo de registro Gen Z:
 * Step 1: Nombre  →  Step 2: Fecha de nacimiento  →  Step 3: Hora (opcional)
 * →  Step 4: Lugar (opcional)  →  Step 5: Reveal (carta natal + arquetipo)
 *
 * Tono: "Mejor Amiga Cósmica" — sin presión, con hype, con magia.
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calculateLifePath, calculateNameValue, reduceToSingleDigitOrMaster, ARCHETYPES } from "@/hooks/useProfile";
import { calculateNatalProfile } from "@/engines/astrology/natal-chart";
import { CosmicShell } from "@/ui/CosmicShell";

/* ============================================================
   STEP CONFIG
   ============================================================ */

const STEPS = [
  { id: "name", emoji: "✨", title: "¿Cómo te llamas?", subtitle: "Tu nombre tiene un poder que el universo reconoce" },
  { id: "birth-date", emoji: "🌟", title: "¿Cuándo llegaste?", subtitle: "Tu fecha de nacimiento es tu código cósmico único" },
  { id: "birth-time", emoji: "🌙", title: "¿A qué hora?", subtitle: "Define tu ascendente — el portal por el que entraste. Si no lo sabes, no pasa nada 💜" },
  { id: "birth-place", emoji: "🗺️", title: "¿Dónde naciste?", subtitle: "El lugar ancla tu carta natal al cosmos" },
  { id: "reveal", emoji: "🔮", title: "Tu código cósmico está listo", subtitle: "El universo ya te conocía — ahora tú también" },
];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function CosmicInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-xs font-medium mb-2 uppercase tracking-widest"
          style={{ color: "hsl(270 60% 65%)", fontFamily: "var(--cosm-font-display)" }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontFamily: "var(--cosm-font-body)",
          background: "hsla(260 40% 8% / 0.8)",
          border: "1px solid hsla(270 60% 40% / 0.4)",
          borderRadius: "16px",
          color: "hsl(0 0% 95%)",
          fontSize: "1.125rem",
          padding: "1rem 1.25rem",
          width: "100%",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "hsla(270 80% 65% / 0.8)";
          e.currentTarget.style.boxShadow = "0 0 20px hsla(270 80% 65% / 0.2)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "hsla(270 60% 40% / 0.4)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function CosmicProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total - 1 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            background: i <= current
              ? "hsl(270 80% 65%)"
              : "hsla(260 40% 40% / 0.4)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ height: 8, borderRadius: 999 }}
        />
      ))}
    </div>
  );
}

function RevealScreen({
  name,
  birthDate,
  onComplete,
}: {
  name: string;
  birthDate: string;
  onComplete: () => void;
}) {
  const lifePathNumber = calculateLifePath(birthDate);
  const archetype = ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1];
  const natal = calculateNatalProfile({ date: birthDate });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center text-center px-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated cosmic sigil */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ width: 120, height: 120 }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid hsla(270 80% 65% / 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            border: "1px solid hsla(310 80% 60% / 0.4)",
          }}
        />
        <span style={{ fontSize: 48 }}>🔮</span>
      </motion.div>

      {/* Name + Life Path */}
      <div>
        <p
          className="text-sm uppercase tracking-widest mb-1"
          style={{ color: "hsl(270 60% 55%)", fontFamily: "var(--cosm-font-display)" }}
        >
          Bienvenida al cosmos,
        </p>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 98%)" }}
        >
          {name}
        </h1>
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            className="w-full space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Big Three */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Sol", data: natal.sunSign, color: "hsl(45 90% 60%)" },
                { label: "Luna", data: natal.moonSign, color: "hsl(270 80% 70%)" },
                { label: "Ascendente", data: natal.risingSign, color: "hsl(175 70% 55%)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center p-4"
                  style={{
                    background: "hsla(260 40% 8% / 0.6)",
                    border: "1px solid hsla(270 60% 40% / 0.3)",
                    borderRadius: 16,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{item.data.symbol}</span>
                  <span
                    className="text-xs font-semibold mt-1"
                    style={{ fontFamily: "var(--cosm-font-display)", color: item.color }}
                  >
                    {item.data.nameEs}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "hsl(260 8% 45%)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Life Path + Archetype */}
            <div
              className="p-5 text-left"
              style={{
                background: "linear-gradient(135deg, hsla(270 60% 15% / 0.6), hsla(310 60% 12% / 0.6))",
                border: "1px solid hsla(270 60% 40% / 0.3)",
                borderRadius: 20,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-3xl font-bold"
                  style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(45 90% 65%)" }}
                >
                  {lifePathNumber}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "hsl(260 8% 50%)" }}>
                    Camino de Vida
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 92%)" }}
                  >
                    {archetype.name}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(260 10% 65%)", fontFamily: "var(--cosm-font-body)" }}>
                {archetype.description}
              </p>
            </div>

            {/* CTA */}
            <motion.button
              onClick={onComplete}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-semibold text-base"
              style={{
                background: "linear-gradient(135deg, hsl(270 80% 60%), hsl(310 80% 58%))",
                color: "hsl(0 0% 98%)",
                fontFamily: "var(--cosm-font-display)",
                border: "none",
                boxShadow: "0 0 30px hsla(270 80% 60% / 0.4)",
              }}
            >
              Explorar mi cosmos ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CosmicOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");

  // Redirect if no user
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const currentStep = STEPS[step];
  const isReveal = currentStep.id === "reveal";

  const canAdvance = (): boolean => {
    if (currentStep.id === "name") return name.trim().length >= 2;
    if (currentStep.id === "birth-date") return birthDate.length === 10;
    return true; // time, place are optional
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const lifePathNumber = calculateLifePath(birthDate);
      const expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "all"));
      const soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "vowels"));
      const personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "consonants"));
      const archetype = ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1];
      const natal = calculateNatalProfile({ date: birthDate });

      const now = new Date().getFullYear();
      const birthParts = birthDate.split("-");
      const birthYear = parseInt(birthParts[0]);
      const birthMonth = parseInt(birthParts[1]);
      const birthDay = parseInt(birthParts[2]);
      const personalYearSum = reduceToSingleDigitOrMaster(birthMonth + birthDay + reduceToSingleDigitOrMaster(now));

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          name: name.trim(),
          birth_date: birthDate,
          birth_time: birthTime || null,
          birth_place: birthPlace.trim() || null,
          life_path_number: lifePathNumber,
          expression_number: expressionNumber,
          soul_urge_number: soulUrgeNumber,
          personality_number: personalityNumber,
          personal_year_number: personalYearSum,
          archetype: archetype.name,
          archetype_description: archetype.description,
          sun_sign: natal.sunSign.nameEs,
          moon_sign: natal.moonSign.nameEs,
          rising_sign: natal.risingSign.nameEs,
          onboarding_completed_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (upsertError) throw upsertError;

      navigate("/dashboard");
    } catch (err: unknown) {
      setError("Algo no fue bien 💜 Intenta de nuevo");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CosmicShell particles particlePalette="violet">
      <div className="flex min-h-screen flex-col px-6 py-10">
        {/* Progress */}
        {!isReveal && (
          <CosmicProgressDots total={STEPS.length} current={step} />
        )}

        {/* Step content */}
        <div className="flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              {!isReveal ? (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <motion.span
                      className="block text-5xl mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {currentStep.emoji}
                    </motion.span>
                    <h1
                      className="text-2xl font-bold leading-tight"
                      style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 97%)" }}
                    >
                      {currentStep.title}
                    </h1>
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 55%)" }}
                    >
                      {currentStep.subtitle}
                    </p>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    {currentStep.id === "name" && (
                      <CosmicInput
                        value={name}
                        onChange={setName}
                        placeholder="Tu nombre completo..."
                        autoFocus
                      />
                    )}
                    {currentStep.id === "birth-date" && (
                      <CosmicInput
                        type="date"
                        label="Fecha de nacimiento"
                        value={birthDate}
                        onChange={setBirthDate}
                        autoFocus
                      />
                    )}
                    {currentStep.id === "birth-time" && (
                      <>
                        <CosmicInput
                          type="time"
                          label="Hora de nacimiento (opcional)"
                          value={birthTime}
                          onChange={setBirthTime}
                          autoFocus
                        />
                        <p
                          className="text-xs text-center"
                          style={{ color: "hsl(260 8% 42%)", fontFamily: "var(--cosm-font-body)" }}
                        >
                          Si no sabes tu hora exacta, puedes saltarte este paso →
                        </p>
                      </>
                    )}
                    {currentStep.id === "birth-place" && (
                      <>
                        <CosmicInput
                          label="Ciudad de nacimiento (opcional)"
                          value={birthPlace}
                          onChange={setBirthPlace}
                          placeholder="Ej: Ciudad de México"
                          autoFocus
                        />
                        <p
                          className="text-xs text-center"
                          style={{ color: "hsl(260 8% 42%)", fontFamily: "var(--cosm-font-body)" }}
                        >
                          Esto permite afinar tu ascendente ✨
                        </p>
                      </>
                    )}
                  </div>

                  {error && (
                    <p className="text-sm text-center" style={{ color: "hsl(0 80% 65%)" }}>
                      {error}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {step > 0 && (
                      <button
                        onClick={handleBack}
                        className="flex-none px-6 py-4 rounded-2xl text-sm font-medium"
                        style={{
                          fontFamily: "var(--cosm-font-display)",
                          background: "hsla(260 40% 15% / 0.4)",
                          border: "1px solid hsla(270 60% 40% / 0.3)",
                          color: "hsl(260 10% 60%)",
                        }}
                      >
                        ←
                      </button>
                    )}
                    <motion.button
                      onClick={handleNext}
                      disabled={!canAdvance()}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-4 rounded-2xl font-semibold text-base"
                      style={{
                        fontFamily: "var(--cosm-font-display)",
                        background: canAdvance()
                          ? "linear-gradient(135deg, hsl(270 80% 60%), hsl(310 80% 58%))"
                          : "hsla(260 40% 20% / 0.4)",
                        color: canAdvance() ? "hsl(0 0% 98%)" : "hsl(260 10% 40%)",
                        border: canAdvance() ? "none" : "1px solid hsla(270 60% 40% / 0.2)",
                        boxShadow: canAdvance() ? "0 0 24px hsla(270 80% 60% / 0.3)" : "none",
                        transition: "all 0.3s",
                      }}
                    >
                      {currentStep.id === "birth-place" ? "Ver mi cosmos →" : "Siguiente →"}
                    </motion.button>
                  </div>

                  {/* Skip for optional steps */}
                  {(currentStep.id === "birth-time" || currentStep.id === "birth-place") && (
                    <button
                      onClick={handleNext}
                      className="w-full text-center text-xs py-2"
                      style={{ color: "hsl(260 8% 40%)", fontFamily: "var(--cosm-font-body)" }}
                    >
                      Saltar por ahora
                    </button>
                  )}
                </div>
              ) : (
                <RevealScreen
                  name={name}
                  birthDate={birthDate}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Saving overlay */}
        <AnimatePresence>
          {saving && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: "hsla(260 40% 4% / 0.9)", zIndex: 50 }}
            >
              <motion.p
                className="text-lg"
                style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(270 80% 70%)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Grabando tu carta cósmica...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CosmicShell>
  );
}
