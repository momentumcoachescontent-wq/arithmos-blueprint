import { useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

// ── Numerology ──────────────────────────────────────────────────────────────
function reduce(n: number): number {
  const masters = [11, 22, 33];
  let cur = n;
  while (cur > 9 && !masters.includes(cur)) {
    cur = String(cur).split("").reduce((a, d) => a + Number(d), 0);
  }
  return cur;
}

function personalDayToday(birthDate: string): number {
  const today = new Date();
  const [, bm, bd] = birthDate.split("-").map(Number);
  return reduce(today.getDate() + (today.getMonth() + 1) + bd + bm);
}

// ── Number triads for affinity ──────────────────────────────────────────────
const TRIADS: Record<number, number[]> = {
  1: [1, 4, 7], 4: [1, 4, 7], 7: [1, 4, 7],
  2: [2, 5, 8], 5: [2, 5, 8], 8: [2, 5, 8],
  3: [3, 6, 9], 6: [3, 6, 9], 9: [3, 6, 9],
  11: [1, 2, 11, 22, 33],
  22: [4, 2, 22, 11, 33],
  33: [3, 6, 33, 11, 22],
};

type Rating = "excelente" | "favorable" | "neutral" | "retador";

function rateHour(hour: number, personalDay: number): Rating {
  // Map 0-23 to 1-9 (1=midnight, cycling)
  const hourNum = (hour % 9) === 0 && hour !== 0 ? 9 : (hour % 9) + (hour === 0 ? 1 : 0);
  const corrected = hourNum === 0 ? 9 : hourNum;

  const pdBase = personalDay > 9 ? (personalDay === 11 ? 2 : personalDay === 22 ? 4 : 6) : personalDay;
  const pdTriad = TRIADS[personalDay] ?? TRIADS[pdBase] ?? [pdBase];

  if (corrected === pdBase || corrected === personalDay) return "excelente";
  if (pdTriad.includes(corrected)) return "favorable";
  // Adjacent numbers are neutral
  if (Math.abs(corrected - pdBase) === 1) return "neutral";
  return "retador";
}

const RATING_META: Record<Rating, { label: string; bar: string; text: string; width: string }> = {
  excelente:  { label: "Excelente",  bar: "bg-amber-400",   text: "text-amber-300",   width: "w-full" },
  favorable:  { label: "Favorable",  bar: "bg-primary/80",  text: "text-primary",     width: "w-3/4" },
  neutral:    { label: "Neutral",    bar: "bg-border",      text: "text-muted-foreground", width: "w-1/2" },
  retador:    { label: "Retador",    bar: "bg-rose-800/60", text: "text-rose-400/70", width: "w-1/4" },
};

function formatHour(h: number): string {
  const ampm = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display} ${ampm}`;
}

const NUM_NAMES: Record<number, string> = {
  1:"Pionero",2:"Diplomático",3:"Comunicador",4:"Arquitecto",5:"Agente de Cambio",
  6:"Estratega",7:"Analista",8:"Ejecutor",9:"Visionario",11:"Iluminador",22:"Constructor",33:"Sanador"
};

// ── Component ───────────────────────────────────────────────────────────────
export default function HorasDelDia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const currentHour = new Date().getHours();
  const currentRef = useRef<HTMLDivElement>(null);

  const personalDay = useMemo(
    () => (profile?.birthDate ? personalDayToday(profile.birthDate) : 1),
    [profile?.birthDate]
  );

  // Show hours 5am–11pm (useful range)
  const hours = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => {
      const h = i + 5;
      return { hour: h, rating: rateHour(h, personalDay) };
    });
  }, [personalDay]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (!profile) return null;

  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const numName = NUM_NAMES[personalDay] ?? "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <p className="text-xs font-sans text-muted-foreground uppercase tracking-[0.3em]">Vibraciones del Día</p>
        <div className="w-9" />
      </div>

      {/* Hero: personal day number */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-4 pb-8 text-center"
      >
        <p className="text-xs font-sans text-muted-foreground uppercase tracking-[0.25em] mb-3 capitalize">{today}</p>
        <div className="relative inline-block">
          <span
            className="font-serif font-bold text-foreground tabular-nums leading-none"
            style={{ fontSize: "clamp(5rem, 22vw, 8rem)" }}
          >
            {personalDay}
          </span>
          {[11, 22, 33].includes(personalDay) && (
            <span className="absolute -top-2 -right-4 text-[10px] font-sans text-yellow-400 font-bold uppercase tracking-wider bg-yellow-400/10 border border-yellow-400/30 rounded px-1.5 py-0.5">
              Maestro
            </span>
          )}
        </div>
        <p className="font-serif text-xl text-muted-foreground mt-1">{numName}</p>
        <p className="text-xs font-sans text-muted-foreground mt-3">Tu número personal calibra cada hora del día</p>
      </motion.div>

      {/* Legend */}
      <div className="px-6 pb-4 flex items-center gap-4 flex-wrap">
        {(Object.entries(RATING_META) as [Rating, typeof RATING_META[Rating]][]).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${meta.bar}`} />
            <span className={`text-[10px] font-sans ${meta.text}`}>{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Hours list */}
      <div className="px-4 pb-12 space-y-2">
        {hours.map(({ hour, rating }, idx) => {
          const meta = RATING_META[rating];
          const isCurrent = hour === currentHour;
          const isPast = hour < currentHour;

          return (
            <motion.div
              ref={isCurrent ? currentRef : undefined}
              key={hour}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: isPast ? 0.4 : 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`
                relative flex items-center gap-4 rounded-2xl px-4 py-3 border transition-all
                ${isCurrent
                  ? "bg-foreground/5 border-foreground/20 ring-1 ring-foreground/20"
                  : "bg-card border-border"
                }
              `}
            >
              {/* Current indicator */}
              {isCurrent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-amber-400" />
              )}

              {/* Hour */}
              <div className="w-14 shrink-0">
                <span className={`font-sans font-bold tabular-nums ${isCurrent ? "text-foreground text-base" : "text-muted-foreground text-sm"}`}>
                  {formatHour(hour)}
                </span>
                {isCurrent && (
                  <p className="text-[9px] font-sans text-amber-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Zap className="h-2.5 w-2.5" /> Ahora
                  </p>
                )}
              </div>

              {/* Bar */}
              <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isPast ? "0%" : undefined }}
                  className={`h-full rounded-full ${meta.bar} ${meta.width}`}
                  style={{ transition: "width 0.6s ease" }}
                />
              </div>

              {/* Label */}
              <span className={`text-xs font-sans w-16 text-right shrink-0 ${meta.text}`}>
                {meta.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
