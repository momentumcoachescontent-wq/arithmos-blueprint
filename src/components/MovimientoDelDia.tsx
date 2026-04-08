import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Eye, ArrowRight, CheckCircle2 } from "lucide-react";
import { ARCHETYPE_CONTEXT } from "@/lib/archetypes";

// ── Numerology helpers ───────────────────────────────────────────────────────
function reduce(n: number): number {
  const masters = [11, 22, 33];
  let cur = n;
  while (cur > 9 && !masters.includes(cur)) {
    cur = String(cur).split("").reduce((a, d) => a + Number(d), 0);
  }
  return cur;
}

function personalDayToday(birthDate: string): number {
  const t = new Date();
  const [, bm, bd] = birthDate.split("-").map(Number);
  return reduce(t.getDate() + (t.getMonth() + 1) + bd + bm);
}

const INSIGHTS: Record<number, string> = {
  1: "El universo respalda a los que actúan primero. Hoy es tuyo para iniciar.",
  2: "La respuesta que buscas viene de escuchar. Pausa antes de decidir.",
  3: "Tu voz es tu recurso más poderoso hoy. Úsala.",
  4: "Los cimientos que construyas hoy sostienen lo que viene.",
  5: "La adaptación es tu ventaja. Abraza lo impredecible.",
  6: "Cuida lo cercano. El impacto real empieza ahí.",
  7: "La claridad está adentro. Retírate del ruido externo.",
  8: "Luz verde en poder y recursos. Negocia desde tu valor real.",
  9: "Suelta lo que no sirve. El espacio que creas atrae lo nuevo.",
  11: "Tu intuición está elevada. Confía en los destellos que recibes.",
  22: "Cada movimiento hoy tiene impacto multiplicado. Actúa con intención.",
  33: "Tu presencia transforma. Ofrece lo mejor sin agotarte.",
};

const ACTIONS: Record<number, string> = {
  1: "Inicia esa conversación que has estado evitando.",
  2: "Busca la perspectiva de alguien en quien confíes antes de decidir.",
  3: "Comunica una idea o propuesta que llevas tiempo guardando.",
  4: "Completa una tarea técnica o de proceso que tengas pendiente.",
  5: "Acepta un cambio que normalmente resistirías.",
  6: "Fortalece activamente un vínculo clave hoy.",
  7: "Dedica 20 minutos de silencio a analizar algo que te preocupa.",
  8: "Toma una decisión de recursos o poder que llevas posponiendo.",
  9: "Cierra o suelta formalmente algo que ya no te aporta.",
  11: "Anota la primera idea que llegue a tu mente al despertar.",
  22: "Avanza una acción concreta en tu proyecto de mayor impacto.",
  33: "Ofrece tu atención completa a alguien que lo necesita hoy.",
};

interface MovimientoDelDiaProps {
  birthDate: string;
  lifePathNumber: number;
  archetypeName: string;
  onAwardXp: (amount: number) => Promise<void>;
}

const TODAY = new Date().toISOString().split("T")[0];
const STORAGE_KEY = `movimiento-done-${TODAY}`;

export function MovimientoDelDia({ birthDate, lifePathNumber, archetypeName, onAwardXp }: MovimientoDelDiaProps) {
  const navigate = useNavigate();
  const [done, setDone] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");
  const [celebrating, setCelebrating] = useState(false);

  const dailyNum = personalDayToday(birthDate);
  const ctx = ARCHETYPE_CONTEXT[lifePathNumber];
  const shadow = ctx?.shadow?.split(" — ")[0] ?? ctx?.shadow ?? "";
  const insight = INSIGHTS[dailyNum] ?? INSIGHTS[1];
  const action  = ACTIONS[dailyNum]  ?? ACTIONS[1];

  async function handleDone() {
    if (done) return;
    setCelebrating(true);
    await onAwardXp(15);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => {
      setCelebrating(false);
      setDone(true);
    }, 1400);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50">
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em]">
          Tu movimiento de hoy
        </p>
        <span className="font-serif font-bold text-2xl text-primary tabular-nums">{dailyNum}</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Insight */}
        <div className="flex gap-3">
          <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm font-sans text-foreground/90 leading-relaxed">{insight}</p>
        </div>

        {/* Sombra activa */}
        <div className="flex gap-3">
          <Eye className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-sans font-bold text-rose-400 uppercase tracking-wider mb-0.5">No caigas aquí</p>
            <p className="text-sm font-sans text-foreground/70 leading-relaxed">{shadow}</p>
          </div>
        </div>

        {/* Acción */}
        <div className="flex gap-3 p-3 bg-primary/5 rounded-xl border border-primary/15">
          <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider mb-0.5">Tu siguiente movimiento</p>
            <p className="text-sm font-sans text-foreground/90 leading-relaxed">{action}</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-5 pb-5 flex gap-3">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-sans font-semibold text-emerald-400">Completado · +15 XP</span>
            </motion.div>
          ) : celebrating ? (
            <motion.div
              key="celebrating"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1.1, 1], opacity: 1 }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30"
            >
              <span className="text-lg">⚡</span>
              <span className="text-sm font-sans font-bold text-amber-400">+15 XP</span>
            </motion.div>
          ) : (
            <motion.button
              key="idle"
              whileTap={{ scale: 0.97 }}
              onClick={handleDone}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans font-semibold hover:bg-primary/90 transition-colors"
            >
              Ya lo hice ✓
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={() => navigate("/coach")}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-sans font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          Quiero más claridad
        </button>
      </div>
    </motion.div>
  );
}
