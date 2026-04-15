import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

// ── Numerology ─────────────────────────────────────────────────────────────
function reduce(n: number): number {
  const masters = [11, 22, 33];
  let cur = n;
  while (cur > 9 && !masters.includes(cur)) {
    cur = String(cur).split("").reduce((a, d) => a + Number(d), 0);
  }
  return cur;
}

function personalDay(birthDate: string, date: Date): number {
  const [, bm, bd] = birthDate.split("-").map(Number);
  return reduce(date.getDate() + (date.getMonth() + 1) + bd + bm);
}

// ── Color map ───────────────────────────────────────────────────────────────
const NUM_COLORS: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1:  { bg: "bg-violet-500/15",  border: "border-violet-500/40",  text: "text-violet-300",  glow: "shadow-violet-500/20" },
  2:  { bg: "bg-teal-500/15",    border: "border-teal-500/40",    text: "text-teal-300",    glow: "shadow-teal-500/20" },
  3:  { bg: "bg-amber-500/15",   border: "border-amber-500/40",   text: "text-amber-300",   glow: "shadow-amber-500/20" },
  4:  { bg: "bg-rose-500/15",    border: "border-rose-500/40",    text: "text-rose-300",    glow: "shadow-rose-500/20" },
  5:  { bg: "bg-orange-500/15",  border: "border-orange-500/40",  text: "text-orange-300",  glow: "shadow-orange-500/20" },
  6:  { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-300", glow: "shadow-emerald-500/20" },
  7:  { bg: "bg-indigo-500/15",  border: "border-indigo-500/40",  text: "text-indigo-300",  glow: "shadow-indigo-500/20" },
  8:  { bg: "bg-cyan-500/15",    border: "border-cyan-500/40",    text: "text-cyan-300",    glow: "shadow-cyan-500/20" },
  9:  { bg: "bg-purple-500/15",  border: "border-purple-500/40",  text: "text-purple-300",  glow: "shadow-purple-500/20" },
  11: { bg: "bg-yellow-400/15",  border: "border-yellow-400/50",  text: "text-yellow-300",  glow: "shadow-yellow-400/30" },
  22: { bg: "bg-yellow-400/15",  border: "border-yellow-400/50",  text: "text-yellow-300",  glow: "shadow-yellow-400/30" },
  33: { bg: "bg-yellow-400/15",  border: "border-yellow-400/50",  text: "text-yellow-300",  glow: "shadow-yellow-400/30" },
};

function getColor(n: number) {
  return NUM_COLORS[n] ?? NUM_COLORS[1];
}

// ── Daily messages ──────────────────────────────────────────────────────────
const MESSAGES: Record<number, { title: string; body: string }> = {
  1:  { title: "Día de Iniciativa", body: "Toma la decisión que has estado evitando. El universo respalda a los que se mueven primero hoy." },
  2:  { title: "Día de Alianzas", body: "Escucha más de lo que hablas. La respuesta que buscas viene de otro." },
  3:  { title: "Día de Expresión", body: "Di lo que sientes. Crea. Conecta. Tu voz es tu recurso más subutilizado hoy." },
  4:  { title: "Día de Estructura", body: "Organiza. Planifica. Los cimientos que pongas hoy sostienen lo que viene." },
  5:  { title: "Día de Cambio", body: "Acepta lo impredecible. La adaptación es tu ventaja competitiva central hoy." },
  6:  { title: "Día de Cuidado", body: "Cuida tu entorno más cercano. El amor estratégico amplifica tu impacto." },
  7:  { title: "Día de Introspección", body: "Retírate del ruido. La respuesta que buscas está dentro, no afuera." },
  8:  { title: "Día de Poder", body: "Negocia. Decide. Actúa con autoridad. Luz verde en temas materiales y de liderazgo." },
  9:  { title: "Día de Cierre", body: "Libera lo que ya no funciona. El espacio que creas hoy atrae lo que necesitas." },
  11: { title: "Día Maestro · Intuición", body: "Confía en los destellos que recibes. Tu percepción está elevada por encima del promedio." },
  22: { title: "Día Maestro · Construcción", body: "Cada acción tiene impacto multiplicado hoy. Actúa con intención total." },
  33: { title: "Día Maestro · Sanación", body: "Tu presencia sana. Ofrece lo mejor de ti sin agotarte." },
};

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ── Component ───────────────────────────────────────────────────────────────
export default function CalendarioNumerico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const today = new Date();

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<{ date: Date; num: number } | null>(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    if (!profile?.birthDate) return [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; num: number } | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, num: personalDay(profile.birthDate, date) });
    }
    return cells;
  }, [profile?.birthDate, year, month]);

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (!profile) return null;

  const selectedMsg = selected ? MESSAGES[selected.num] ?? MESSAGES[1] : null;
  const selectedColor = selected ? getColor(selected.num) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <p className="text-xs font-sans text-muted-foreground uppercase tracking-[0.3em]">Calendario Numérico</p>
        <div className="w-9" />
      </div>

      {/* Month navigator */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>

          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-serif font-bold text-foreground uppercase tracking-wider" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)" }}>
              {MONTHS[month]}
            </h1>
            <p className="text-xs font-sans text-muted-foreground">{year}</p>
          </motion.div>

          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 px-3 flex-1">
        {days.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          const { date, num } = cell;
          const c = getColor(num);
          const isT = isToday(date);
          const isSel = selected?.date.toDateString() === date.toDateString();
          const isMaster = [11, 22, 33].includes(num);

          return (
            <motion.button
              key={date.toDateString()}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelected(isSel ? null : { date, num })}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center border transition-all
                ${c.bg} ${c.border}
                ${isT ? `ring-2 ring-white/50 shadow-lg ${c.glow}` : ""}
                ${isSel ? `ring-2 ring-white/70 scale-105` : ""}
              `}
            >
              {/* Day of month */}
              <span className={`text-[9px] font-sans font-bold absolute top-1 left-0 right-0 text-center ${isT ? "text-white/80" : "text-muted-foreground/60"}`}>
                {date.getDate()}
              </span>

              {/* Personal number */}
              <span className={`font-serif font-bold tabular-nums ${c.text} ${isMaster ? "text-sm" : "text-xl"} leading-none`}>
                {num}
              </span>

              {/* Master indicator */}
              {isMaster && (
                <span className="text-[7px] font-sans font-bold text-yellow-400 uppercase tracking-wider">★</span>
              )}

              {/* Today dot */}
              {isT && (
                <span className="absolute bottom-1 left-0 right-0 flex justify-center">
                  <span className="w-1 h-1 rounded-full bg-white" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-4 flex flex-wrap gap-2 justify-center">
        {[
          { label: "Maestro", c: "bg-yellow-400/20 border-yellow-400/40 text-yellow-300" },
          { label: "Hoy", c: "ring-2 ring-white/50 bg-white/5 text-white" },
        ].map(({ label, c }) => (
          <span key={label} className={`text-[10px] font-sans px-2 py-0.5 rounded-full border ${c}`}>{label}</span>
        ))}
      </div>

      {/* Bottom sheet — day detail */}
      <AnimatePresence>
        {selected && selectedMsg && selectedColor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl px-6 pt-6 pb-10"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-[0.2em] mb-1">
                    {selected.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <h2 className={`font-serif font-bold text-2xl ${selectedColor.text}`}>{selectedMsg.title}</h2>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`font-serif font-bold text-5xl tabular-nums ${selectedColor.text}`}>{selected.num}</span>
                  {[11, 22, 33].includes(selected.num) && (
                    <span className="text-[9px] font-sans text-yellow-400 font-bold uppercase tracking-wider">Maestro</span>
                  )}
                </div>
              </div>
              <p className="font-sans text-foreground/80 text-sm leading-relaxed">{selectedMsg.body}</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate(`/horas?date=${selected.date.toISOString().split("T")[0]}`)}
                  className="flex-1 py-3 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-200 text-sm font-bold font-sans hover:bg-violet-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>⏰</span> Ver horario cósmico
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 rounded-xl border border-border text-muted-foreground text-sm font-sans hover:bg-secondary transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
