import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicCard, CosmicBadge } from "@/ui/CosmicCard";
import {
  SPREADS,
  performReading,
  type SpreadType,
  type TarotReading,
  type DrawnCard,
} from "@/engines/tarot/deck";

/* ============================================
   TAROT CARD VISUAL
   ============================================ */

function TarotCardVisual({
  drawn,
  revealed,
  onClick,
  index,
}: {
  drawn: DrawnCard;
  revealed: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
      onClick={onClick}
    >
      {/* Card */}
      <motion.div
        className="relative w-20 h-32 rounded-xl overflow-hidden"
        style={{
          perspective: "800px",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="back"
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, hsl(280 60% 18%), hsl(260 40% 12%))",
                border: "1px solid hsl(270 60% 30% / 0.5)",
                boxShadow: "0 0 20px -5px hsl(270 80% 65% / 0.2)",
              }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-2xl opacity-50">✦</span>
            </motion.div>
          ) : (
            <motion.div
              key="front"
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl p-2"
              style={{
                background: "linear-gradient(180deg, hsl(260 15% 10%), hsl(260 20% 6%))",
                border: `1px solid ${drawn.reversed ? "hsl(310 80% 60% / 0.4)" : "hsl(270 80% 65% / 0.4)"}`,
                boxShadow: drawn.reversed
                  ? "0 0 20px -5px hsl(310 80% 60% / 0.3)"
                  : "0 0 20px -5px hsl(270 80% 65% / 0.3)",
                transform: drawn.reversed ? "rotate(180deg)" : "none",
              }}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl mb-1">{drawn.card.emoji}</span>
              <span
                className="text-[8px] text-center font-medium leading-tight"
                style={{ color: "hsl(260 10% 70%)" }}
              >
                {drawn.card.arcana === "major" ? drawn.card.nameEs : drawn.card.nameEs.split(" de ")[0]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Position label */}
      <p
        className="mt-2 text-[10px] text-center max-w-[80px] leading-tight"
        style={{
          fontFamily: "var(--cosm-font-body)",
          color: "hsl(260 10% 50%)",
        }}
      >
        {drawn.position}
      </p>

      {/* Reversed badge */}
      {revealed && drawn.reversed && (
        <CosmicBadge variant="magenta" size="sm" className="mt-1">
          Invertida
        </CosmicBadge>
      )}
    </motion.div>
  );
}

/* ============================================
   READING INTERPRETATION
   ============================================ */

function ReadingInterpretation({ reading }: { reading: TarotReading }) {
  return (
    <motion.div
      className="space-y-4 mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {/* Síntesis Global V3.3 */}
      {reading.synthesis && (
        <CosmicCard 
          padding="md" 
          glow="violet" 
          className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent"
        >
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-xl flex-shrink-0">
               ✨
             </div>
             <div>
                <h3 
                  className="text-sm font-bold mb-1.5 uppercase tracking-widest text-violet-200"
                  style={{ fontFamily: "var(--cosm-font-display)" }}
                >
                  Síntesis Cósmica
                </h3>
                <p 
                  className="text-sm leading-relaxed text-white/90 italic" 
                  style={{ fontFamily: "var(--cosm-font-display)" }}
                >
                  {reading.synthesis}
                </p>
             </div>
          </div>
        </CosmicCard>
      )}

      <div className="h-px w-full bg-white/5 my-2" />
      
      <div className="space-y-3">
        {reading.cards.map((drawn, i) => (
        <CosmicCard key={i} padding="sm" glow="none">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">{drawn.card.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 90%)" }}
                >
                  {drawn.card.nameEs}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "hsl(260 8% 45%)" }}
                >
                  · {drawn.position}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 65%)" }}
              >
                {drawn.reversed ? drawn.card.meaningReversed : drawn.card.meaningUpright}
              </p>
            </div>
          </div>
        </CosmicCard>
        ))}
      </div>
    </motion.div>
  );
}

/* ============================================
   MAIN TAROT SPREADS VIEW
   ============================================ */

export function TarotSpreadsView() {
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const spreadOptions = useMemo(() => Object.values(SPREADS).filter(s => s.type !== "daily"), []);

  const startReading = useCallback((type: SpreadType) => {
    setSelectedSpread(type);
    setReading(performReading(type));
    setRevealedCards(new Set());
  }, []);

  const revealCard = useCallback((index: number) => {
    setRevealedCards((prev) => new Set([...prev, index]));
  }, []);

  const allRevealed = reading ? revealedCards.size === reading.cards.length : false;

  if (!selectedSpread || !reading) {
    return (
      <div className="px-4 py-6">
        <h2
          className="text-lg font-bold mb-1"
          style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
        >
          Tiradas de Tarot
        </h2>
        <p
          className="text-sm mb-5"
          style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 55%)" }}
        >
          Elige una tirada y toca cada carta para revelarla
        </p>

        <div className="space-y-3">
          {spreadOptions.map((spread) => (
            <CosmicCard
              key={spread.type}
              glow="violet"
              padding="md"
              onClick={() => startReading(spread.type)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{
                    background: "hsl(270 80% 65% / 0.12)",
                  }}
                >
                  {spread.type === "past-present-future" ? "⏳" : 
                   spread.type === "love" ? "💞" : 
                   spread.type === "decision" ? "⚖️" : "🏥"}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-sm font-semibold"
                    style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 92%)" }}
                  >
                    {spread.nameEs}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 55%)" }}
                  >
                    {spread.description}
                  </p>
                </div>
                <span style={{ color: "hsl(260 10% 40%)" }}>→</span>
              </div>
            </CosmicCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => { setSelectedSpread(null); setReading(null); }}
        className="flex items-center gap-1 mb-4 text-sm"
        style={{
          fontFamily: "var(--cosm-font-body)",
          color: "hsl(260 10% 55%)",
        }}
      >
        ← Volver a tiradas
      </button>

      <h2
        className="text-lg font-bold mb-1"
        style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
      >
        {SPREADS[selectedSpread].nameEs}
      </h2>
      <p
        className="text-xs mb-6"
        style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 50%)" }}
      >
        {allRevealed ? "Lectura completa ✨" : "Toca cada carta para revelarla"}
      </p>

      {/* Cards layout - Adapts to single row or grid for therapeutic spread */}
      <div className={`grid ${reading.cards.length > 3 ? "grid-cols-3 gap-y-6" : "flex justify-center"} gap-x-2`}>
        {reading.cards.map((drawn, i) => (
          <TarotCardVisual
            key={i}
            drawn={drawn}
            revealed={revealedCards.has(i)}
            onClick={() => revealCard(i)}
            index={i}
          />
        ))}
      </div>

      {/* Interpretations */}
      {allRevealed && <ReadingInterpretation reading={reading} />}

      {/* New reading button */}
      {allRevealed && (
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => startReading(selectedSpread)}
            className="cosmic-btn-ghost text-sm"
          >
            Nueva tirada
          </button>
        </motion.div>
      )}
    </div>
  );
}
