/**
 * Arithmos V3 — Cosmic Feed Engine
 * 
 * "Tu Día Cósmico" — The heart of the product.
 * Integrates Numerology + Astrology + Tarot into a single
 * holistic daily reading with actionable cosmic guidance.
 */

import { calculateSunSign, calculateMoonSign, type ZodiacSign } from "@/engines/astrology/natal-chart";
import { getDailyCard, type DrawnCard } from "@/engines/tarot/deck";
import {
  reduceToSingleDigitOrMaster,
  ARCHETYPES,
} from "@/hooks/useProfile";

/* ============================================
   TYPES
   ============================================ */

export interface CosmicDayReading {
  /** Overall alignment score 0-100 */
  alignmentScore: number;
  /** Today's date */
  date: string;
  /** Numerology section */
  numerology: {
    personalDay: number;
    personalMonth: number;
    personalYear: number;
    archetype: { name: string; description: string };
    insight: string;
  };
  /** Astrology section */
  astrology: {
    sunSign: ZodiacSign;
    moonSign: ZodiacSign;
    sunInsight: string;
    moonInsight: string;
  };
  /** Tarot section */
  tarot: {
    dailyCard: DrawnCard;
    insight: string;
  };
  /** Unified cosmic action */
  cosmicAction: {
    title: string;
    description: string;
    duration: string; // e.g. "30 segundos"
    emoji: string;
  };
  /** Mood of the day */
  cosmicMood: "expansive" | "introspective" | "transformative" | "harmonious" | "electric";
}

/* ============================================
   PERSONAL DAY/MONTH/YEAR CALCULATIONS
   ============================================ */

function calculatePersonalYear(birthDate: string, targetYear: number): number {
  const [, monthStr, dayStr] = birthDate.split("-");
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  const sum = month + day + reduceToSingleDigitOrMaster(targetYear);
  return reduceToSingleDigitOrMaster(sum);
}

function calculatePersonalMonth(personalYear: number, targetMonth: number): number {
  return reduceToSingleDigitOrMaster(personalYear + targetMonth);
}

function calculatePersonalDay(personalMonth: number, targetDay: number): number {
  return reduceToSingleDigitOrMaster(personalMonth + targetDay);
}

/* ============================================
   INSIGHT GENERATORS
   ============================================ */

const NUMEROLOGY_INSIGHTS: Record<number, string> = {
  1: "Hoy la energía es de inicio. Atrévete a dar el primer paso en algo que has postergado.",
  2: "Día de conexiones. Escucha más de lo que hablas — alguien tiene un mensaje para ti.",
  3: "Tu creatividad está en su punto máximo. Exprésate sin filtros, el universo quiere oírte.",
  4: "Día de construir bases sólidas. Lo que planees hoy tendrá estructura duradera.",
  5: "Libertad y cambio en el aire. Rompe una rutina — la magia está fuera de tu zona de comfort.",
  6: "Armonía y amor. Cuida de alguien (incluida tú) y verás cómo la energía se multiplica.",
  7: "Introspección profunda. Tu intuición está más afilada que nunca. Medita, escribe, observa.",
  8: "Poder y abundancia. Negocia, pide, cobra lo que vales. El universo respalda tu autoridad.",
  9: "Cierre de ciclo. Suelta algo que ya cumplió su propósito. Haz espacio para lo nuevo.",
  11: "Portal maestro activo. Tu sensibilidad está al máximo — canaliza la inspiración, no la ansiedad.",
  22: "Constructor maestro. Hoy puedes materializar lo que otros solo sueñan. Piensa en grande.",
  33: "Vibración sanadora. Tu presencia sola transforma a quien te rodea. Sé consciente de tu impacto.",
};

const MOON_INSIGHTS: Record<string, string> = {
  fire: "La luna activa tu fuego interior. Cuidado con reacciones impulsivas, pero aprovecha la pasión.",
  water: "Emociones a flor de piel hoy. Permítete sentir sin juzgar. El agua limpia lo que la mente no puede.",
  air: "Tu mente va a mil. Buenísimo para conversaciones profundas y decisiones intelectuales.",
  earth: "Energía grounded. Buen día para cosas tangibles: orden, finanzas, cuerpo, naturaleza.",
};

const SUN_INSIGHTS: Record<string, string> = {
  fire: "Tu esencia de fuego pide acción hoy. No planees — ejecuta.",
  water: "Tu naturaleza acuática te pide fluir. No fuerces; deja que las cosas lleguen.",
  air: "Tu ser mental necesita estímulo intelectual. Lee, debate, cuestiona.",
  earth: "Tu raíz terrenal pide estabilidad. Construye algo tangible hoy.",
};

const COSMIC_ACTIONS: Record<number, { title: string; description: string; emoji: string }> = {
  1: { title: "Escribe tu intención", description: "En una nota, escribe UNA cosa que quieres iniciar. Léela en voz alta 3 veces.", emoji: "✍️" },
  2: { title: "Mensaje de gratitud", description: "Envía un mensaje a alguien agradeciéndole algo específico. Sin esperar respuesta.", emoji: "💌" },
  3: { title: "Voz libre", description: "Graba un audio de 30 segundos diciéndote lo que nadie se atreve a decirte.", emoji: "🎤" },
  4: { title: "Ordena un espacio", description: "Elige una gaveta, una carpeta o un rincón. Ordénalo con intención. El orden externo ordena tu mente.", emoji: "📦" },
  5: { title: "Rompe una rutina", description: "Toma un camino diferente, pide algo nuevo en el café, habla con un desconocido.", emoji: "🔀" },
  6: { title: "Autocuidado radical", description: "10 minutos de algo solo para ti. Baño, mascarilla, estiramiento, silencio. SIN pantallas.", emoji: "🛁" },
  7: { title: "3 minutos de silencio", description: "Cierra los ojos. Respira profundo 7 veces. Observa qué imagen o palabra llega.", emoji: "🧘" },
  8: { title: "Cobra tu valor", description: "Hoy pide algo que mereces: un aumento, reconocimiento, respeto, o tu propio tiempo.", emoji: "💪" },
  9: { title: "Carta de cierre", description: "Escribe una carta a algo que necesitas soltar (persona, hábito, miedo). Puedes quemarla.", emoji: "🔥" },
  11: { title: "Canal de intuición", description: "Antes de dormir, escribe una pregunta en un papel y ponlo bajo tu almohada.", emoji: "🌙" },
  22: { title: "Visualiza tu imperio", description: "5 minutos con ojos cerrados. Visualiza tu vida exacta dentro de 3 años. Con detalles.", emoji: "🏛️" },
  33: { title: "Toca a alguien", description: "Un abrazo, una mano en el hombro, una sonrisa a un extraño. Tu energía sana hoy.", emoji: "🤲" },
};

/* ============================================
   ALIGNMENT SCORE CALCULATOR
   ============================================ */

function calculateAlignmentScore(
  personalDay: number,
  sunElement: string,
  moonElement: string,
  cardReversed: boolean,
  cardArcana: string
): number {
  let score = 60; // Base alignment

  // Numerology boost: master numbers = higher alignment
  if ([11, 22, 33].includes(personalDay)) score += 15;
  else if ([1, 3, 5, 8].includes(personalDay)) score += 8;
  else score += 3;

  // Element harmony between sun and moon
  if (sunElement === moonElement) score += 10; // Same element = aligned
  const harmonica: Record<string, string[]> = {
    fire: ["air"],
    air: ["fire"],
    water: ["earth"],
    earth: ["water"],
  };
  if (harmonica[sunElement]?.includes(moonElement)) score += 7;

  // Tarot influence
  if (cardArcana === "major") score += 5; // Major Arcana = more significant day
  if (cardReversed) score -= 8; // Reversed = some friction

  // Clamp to 0-100
  return Math.min(100, Math.max(0, score));
}

function determineMood(
  personalDay: number,
  sunElement: string,
  alignmentScore: number
): CosmicDayReading["cosmicMood"] {
  if (alignmentScore > 85) return "electric";
  if ([11, 22, 33].includes(personalDay)) return "transformative";
  if (sunElement === "water" || personalDay === 7) return "introspective";
  if (sunElement === "air" || personalDay === 6) return "harmonious";
  return "expansive";
}

/* ============================================
   MAIN: Generate Today's Cosmic Reading
   ============================================ */

export function generateCosmicDay(
  userId: string,
  birthDate: string,
  lifePathNumber: number,
  date?: Date
): CosmicDayReading {
  const today = date || new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // --- NUMEROLOGY ---
  const personalYear = calculatePersonalYear(birthDate, year);
  const personalMonth = calculatePersonalMonth(personalYear, month);
  const personalDay = calculatePersonalDay(personalMonth, day);
  const archetype = ARCHETYPES[lifePathNumber] || ARCHETYPES[1];
  const numInsight = NUMEROLOGY_INSIGHTS[personalDay] || NUMEROLOGY_INSIGHTS[1];

  // --- ASTROLOGY ---
  const sunSign = calculateSunSign(birthDate);
  const moonSign = calculateMoonSign(dateStr); // Current moon sign (for today)
  const sunInsight = SUN_INSIGHTS[sunSign.element] || SUN_INSIGHTS.fire;
  const moonInsight = MOON_INSIGHTS[moonSign.element] || MOON_INSIGHTS.water;

  // --- TAROT ---
  const dailyCard = getDailyCard(userId, today);
  const tarotInsight = dailyCard.reversed
    ? dailyCard.card.meaningReversed
    : dailyCard.card.meaningUpright;

  // --- ALIGNMENT ---
  const alignmentScore = calculateAlignmentScore(
    personalDay,
    sunSign.element,
    moonSign.element,
    dailyCard.reversed,
    dailyCard.card.arcana
  );

  // --- COSMIC ACTION ---
  const action = COSMIC_ACTIONS[personalDay] || COSMIC_ACTIONS[1];

  // --- MOOD ---
  const cosmicMood = determineMood(personalDay, sunSign.element, alignmentScore);

  return {
    alignmentScore,
    date: dateStr,
    numerology: {
      personalDay,
      personalMonth,
      personalYear,
      archetype,
      insight: numInsight,
    },
    astrology: {
      sunSign,
      moonSign,
      sunInsight,
      moonInsight,
    },
    tarot: {
      dailyCard,
      insight: tarotInsight,
    },
    cosmicAction: {
      ...action,
      duration: "30 segundos",
    },
    cosmicMood,
  };
}
