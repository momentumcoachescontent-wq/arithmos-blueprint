import { motion } from "framer-motion";
import { CosmicCard, CosmicBadge, CosmicIconCircle } from "@/ui/CosmicCard";
import { type CosmicDayReading } from "@/engines/cosmic-feed";

interface CosmicFeedProps {
  reading: CosmicDayReading;
  profile: any; // Using any for brevity, should ideally use Profile type
}

/* ============================================
   ALIGNMENT RING — Central visual score
   ============================================ */

function AlignmentRing({ score, mood }: { score: number; mood: string }) {
  const circumference = 2 * Math.PI * 52;
  const progress = (score / 100) * circumference;

  const moodColors: Record<string, string> = {
    expansive: "hsl(45 90% 60%)",
    introspective: "hsl(270 80% 65%)",
    transformative: "hsl(310 80% 60%)",
    harmonious: "hsl(175 70% 50%)",
    electric: "hsl(190 90% 60%)",
  };

  const moodLabels: Record<string, string> = {
    expansive: "Expansivo",
    introspective: "Introspectivo",
    transformative: "Transformador",
    harmonious: "Armonioso",
    electric: "Eléctrico",
  };

  const color = moodColors[mood] || moodColors.expansive;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Background ring */}
        <svg className="absolute inset-0" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="hsl(260 15% 16%)"
            strokeWidth="6"
          />
          <motion.circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 60 60)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        {/* Score number */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <span
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--cosm-font-display)", color }}
          >
            {score}
          </span>
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: "hsl(260 10% 55%)" }}
          >
            alineación
          </span>
        </motion.div>
      </div>
      <CosmicBadge variant={mood === "electric" ? "magenta" : mood === "harmonious" ? "teal" : "violet"} className="mt-3">
        {moodLabels[mood] || mood}
      </CosmicBadge>
    </div>
  );
}

/* ============================================
   NUMEROLOGY SECTION
   ============================================ */

function NumerologySection({ data }: { data: CosmicDayReading["numerology"] }) {
  return (
    <CosmicCard glow="gold" padding="md" className="animate-fade-in-up stagger-1">
      <div className="flex items-start gap-3">
        <CosmicIconCircle icon="🔢" color="gold" size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
            >
              Numerología
            </h3>
            <CosmicBadge variant="gold">Día {data.personalDay}</CosmicBadge>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 70%)" }}
          >
            {data.insight}
          </p>
          <div className="mt-2 flex gap-2">
            <span className="text-xs" style={{ color: "hsl(260 8% 50%)" }}>
              Mes {data.personalMonth} · Año {data.personalYear} · {data.archetype.name}
            </span>
          </div>
        </div>
      </div>
    </CosmicCard>
  );
}

/* ============================================
   ASTROLOGY SECTION
   ============================================ */

function AstrologySection({ data }: { data: CosmicDayReading["astrology"] }) {
  return (
    <CosmicCard glow="violet" padding="md" className="animate-fade-in-up stagger-2">
      <div className="flex items-start gap-3">
        <CosmicIconCircle icon={data.sunSign.symbol} color="violet" size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
            >
              Astrología
            </h3>
            <CosmicBadge variant="violet">
              {data.sunSign.nameEs} {data.sunSign.symbol}
            </CosmicBadge>
          </div>
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 70%)" }}
          >
            {data.sunInsight}
          </p>
          <div
            className="rounded-lg p-2"
            style={{ background: "hsl(260 20% 100% / 0.03)" }}
          >
            <p className="text-xs" style={{ color: "hsl(260 10% 55%)" }}>
              🌙 Luna en {data.moonSign.nameEs}: {data.moonInsight}
            </p>
          </div>
        </div>
      </div>
    </CosmicCard>
  );
}

/* ============================================
   TAROT SECTION
   ============================================ */

function TarotSection({ data }: { data: CosmicDayReading["tarot"] }) {
  const { dailyCard, insight } = data;
  const isReversed = dailyCard.reversed;

  return (
    <CosmicCard glow="magenta" padding="md" className="animate-fade-in-up stagger-3">
      <div className="flex items-start gap-3">
        <motion.div
          className="flex h-14 w-10 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, hsl(280 70% 20%), hsl(310 60% 25%))",
            border: "1px solid hsl(310 80% 60% / 0.3)",
            fontSize: "1.5rem",
            transform: isReversed ? "rotate(180deg)" : "none",
          }}
          whileHover={{ scale: 1.1, rotate: isReversed ? 180 : 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {dailyCard.card.emoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
            >
              Tarot del Día
            </h3>
            <CosmicBadge variant="magenta">
              {dailyCard.card.nameEs}
            </CosmicBadge>
            {isReversed && (
              <CosmicBadge variant="ghost">Invertida</CosmicBadge>
            )}
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 70%)" }}
          >
            {insight}
          </p>
        </div>
      </div>
    </CosmicCard>
  );
}

/* ============================================
   CHINESE ZODIAC SECTION
   ============================================ */

function ChineseZodiacSection({ profile }: { profile: any }) {
  if (!profile.chineseSign) return null;
  
  const getSymbol = (sign: string) => {
    const map: Record<string, string> = {
      "Dragón": "🐉", "Tigre": "🐅", "Rata": "🐀", "Buey": "🐂", 
      "Conejo": "🐇", "Serpiente": "🐍", "Caballo": "🐎", "Cabra": "🐐", 
      "Mono": "🐒", "Gallo": "🐓", "Perro": "🐕", "Cerdo": "🐖"
    };
    return map[sign] || "🧧";
  };

  return (
    <CosmicCard glow="indigo" padding="md" className="animate-fade-in-up stagger-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(79,70,229,0.1)] grayscale hover:grayscale-0 transition-all">
          {getSymbol(profile.chineseSign)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
            >
              Horóscopo Chino
            </h3>
            <CosmicBadge variant="indigo">
              {profile.chineseSign} de {profile.chineseElement}
            </CosmicBadge>
          </div>
          <p className="text-[12px] text-white/90 leading-tight mb-2">
            {profile.chineseDailyGuide || "Tu esencia brilla con fuerza hoy."}
          </p>
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>Energía de {profile.chineseElement}</span>
            <span className="uppercase tracking-widest font-bold">Año del Caballo de Fuego (2026)</span>
          </div>
        </div>
      </div>
    </CosmicCard>
  );
}



/* ============================================
   MAIN COSMIC FEED COMPONENT
   ============================================ */

export function CosmicFeed({ reading, profile }: CosmicFeedProps) {
  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <motion.div
        className="text-center mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
        >
          Tu Día Cósmico
        </h1>
        <p
          className="text-xs mt-1 uppercase tracking-widest"
          style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 8% 45%)" }}
        >
          {new Date(reading.date).toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </motion.div>

      {/* Alignment Score Ring */}
      <div className="flex justify-center py-2">
        <AlignmentRing score={reading.alignmentScore} mood={reading.cosmicMood} />
      </div>

      {/* Four systems */}
      <NumerologySection data={reading.numerology} />
      <AstrologySection data={reading.astrology} />
      <TarotSection data={reading.tarot} />
      <ChineseZodiacSection profile={profile} />
    </div>
  );
}
