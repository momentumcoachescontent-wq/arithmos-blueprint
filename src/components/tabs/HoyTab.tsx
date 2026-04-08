import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { MovimientoDelDia } from "@/components/MovimientoDelDia";
import { XPBar } from "@/components/XPBar";
import { ARCHETYPE_CONTEXT } from "@/lib/archetypes";
import type { Subscription } from "@/hooks/useSubscription";
import type { UserStats } from "@/hooks/useStats";

// ── helpers ──────────────────────────────────────────────────────────────────
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

const DAY_TITLE: Record<number, string> = {
  1:"iniciativa",2:"alianzas",3:"expresión",4:"estructura",5:"cambio",
  6:"cuidado",7:"introspección",8:"poder",9:"cierre",
  11:"intuición maestra",22:"construcción maestra",33:"sanación maestra",
};

const POTENCIA: Record<number, string[]> = {
  1:["Actuar antes de tener toda la información","Liderar sin pedir permiso"],
  2:["Escuchar y detectar lo que no se dice","Construir coaliciones con paciencia"],
  3:["Comunicar ideas complejas con claridad","Generar momentum social"],
  4:["Ejecutar con disciplina sostenida","Construir sistemas que escalan"],
  5:["Pivotar sin parálisis","Leer oportunidades emergentes rápido"],
  6:["Sostener roles de liderazgo emocional","Inspirar confianza genuina"],
  7:["Diagnosticar sistemas complejos","Decidir desde evidencia, no ruido"],
  8:["Tomar decisiones de alto impacto bajo presión","Magnetizar recursos"],
  9:["Inspirar movimientos de largo plazo","Integrar perspectivas opuestas"],
  11:["Intuición estratégica de alto nivel","Percibir dinámicas que otros no ven"],
  22:["Arquitectar proyectos de escala","Aterrizar lo visionario en lo estructural"],
  33:["Crear impacto emocional profundo","Sostener espacios de transformación"],
};

const EVITAR: Record<number, string[]> = {
  1:["Controlar en lugar de liderar","Actuar solo cuando necesitas apoyo"],
  2:["Ceder cuando deberías sostener tu posición","Confundir diplomacia con evitar el conflicto"],
  3:["Iniciar varios proyectos sin terminar ninguno","Comprometerte con todo y no profundizar en nada"],
  4:["Defender sistemas que ya no funcionan","Resistir el cambio por miedo al caos"],
  5:["Llamar 'libertad' a lo que es en realidad huida","Comprometerte a medias"],
  6:["Cargar responsabilidades ajenas hasta el agotamiento","Ayudar para sentirte necesario"],
  7:["Investigar eternamente para no actuar","Confundir 'necesito más datos' con miedo a equivocarte"],
  8:["Operar en extremos: dominar o rendirte","Abusar de autoridad cuando sientes que pierdes control"],
  9:["Perderte en la visión y no bajar a la ejecución","Comenzar ciclos sin cerrar los anteriores"],
  11:["Paralizarte por la presión de estar a tu 'nivel'","Ignorar tu intuición por racionalizar demasiado"],
  22:["Poner el estándar tan alto que nada es suficiente para empezar","Perfeccionar en vez de lanzar"],
  33:["Dar hasta el agotamiento total","Resentir a quienes no reconocen tu entrega"],
};

// ── Component ────────────────────────────────────────────────────────────────
interface HoyTabProps {
  profile: {
    name: string;
    birthDate: string;
    lifePathNumber: number;
    archetype: string;
  };
  stats: UserStats;
  streak: number;
  awardXp: (amount: number) => Promise<void>;
}

export function HoyTab({ profile, stats, streak, awardXp }: HoyTabProps) {
  const dailyNum = personalDayToday(profile.birthDate);
  const dayTitle = DAY_TITLE[dailyNum] ?? "enfoque";
  const ctx = ARCHETYPE_CONTEXT[profile.lifePathNumber];
  const potencia = POTENCIA[profile.lifePathNumber] ?? POTENCIA[1];
  const evitar   = EVITAR[profile.lifePathNumber]   ?? EVITAR[1];
  const firstName = profile.name.split(" ")[0];
  const isMaster = [11, 22, 33].includes(dailyNum);

  const todayStr = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="px-4 pt-6 pb-6 space-y-5 max-w-lg mx-auto">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2 pb-4"
      >
        <p className="text-xs font-sans text-muted-foreground capitalize mb-4">{todayStr}</p>

        {/* Daily number — the hero element */}
        <div className="relative inline-flex items-center justify-center mb-3">
          <span
            className="font-serif font-bold text-foreground tabular-nums leading-none"
            style={{ fontSize: "clamp(5.5rem, 24vw, 8rem)" }}
          >
            {dailyNum}
          </span>
          {isMaster && (
            <span className="absolute -top-1 -right-5 text-[9px] font-sans text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/30 rounded px-1.5 py-0.5 uppercase tracking-wider">
              Maestro
            </span>
          )}
        </div>

        <p className="text-xs font-sans text-muted-foreground uppercase tracking-[0.25em] mb-1">
          Día de {dayTitle}
        </p>
        <h1 className="font-serif font-bold text-foreground" style={{ fontSize: "clamp(1.4rem, 5vw, 1.9rem)" }}>
          {profile.archetype}
        </h1>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          hola, {firstName} · hoy estás en modo <span className="text-foreground/80">{profile.archetype.replace("El ", "").replace("La ", "")}</span>
        </p>
      </motion.div>

      {/* ── Movimiento del Día ── */}
      <MovimientoDelDia
        birthDate={profile.birthDate}
        lifePathNumber={profile.lifePathNumber}
        archetypeName={profile.archetype}
        onAwardXp={awardXp}
      />

      {/* ── Lo que te potencia / Lo que debes evitar ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Potencia */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-emerald-500/20 rounded-2xl p-4"
        >
          <p className="text-[9px] font-sans font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3">
            Lo que te abre camino
          </p>
          <ul className="space-y-2">
            {potencia.map((p, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-emerald-400 mt-0.5 text-xs">↑</span>
                <span className="text-xs font-sans text-foreground/80 leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Evitar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-rose-500/20 rounded-2xl p-4"
        >
          <p className="text-[9px] font-sans font-bold text-rose-400 uppercase tracking-[0.2em] mb-3">
            No caigas aquí
          </p>
          <ul className="space-y-2">
            {evitar.map((e, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-rose-400 mt-0.5 text-xs">↓</span>
                <span className="text-xs font-sans text-foreground/80 leading-snug">{e}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Progreso ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl px-5 py-4"
      >
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Tu progreso</p>
        <div className="flex items-center gap-4">
          {/* Racha */}
          <div className="flex items-center gap-1.5">
            <Flame className={`h-5 w-5 ${streak >= 7 ? "text-amber-400" : streak >= 3 ? "text-orange-400" : "text-muted-foreground"}`} />
            <div>
              <p className="text-lg font-serif font-bold text-foreground tabular-nums leading-none">{streak}</p>
              <p className="text-[9px] font-sans text-muted-foreground">{streak === 1 ? "día" : "días"}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          {/* XP */}
          <div className="flex-1">
            <XPBar
              xp={stats.xp}
              level={stats.level}
              nextLevelXp={stats.nextLevelXp}
              progressPercent={stats.progressPercent}
              compact
            />
          </div>
        </div>
      </motion.div>

    </div>
  );
}
