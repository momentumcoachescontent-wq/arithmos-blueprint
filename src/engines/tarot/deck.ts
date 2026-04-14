/**
 * Arithmos V3 — Tarot Engine
 * 
 * Complete 78-card Rider-Waite-Smith deck with Major and Minor Arcana.
 * Each card includes upright and reversed meanings, element, planet/sign
 * association, and keywords for AI prompt enrichment.
 */

export interface TarotCard {
  id: number;
  name: string;
  nameEs: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  /** Zodiac sign or planet association */
  association: string;
  element: "fire" | "water" | "air" | "earth" | "spirit";
  keywords: string[];
  keywordsEs: string[];
  meaningUpright: string;
  meaningReversed: string;
  /** Unicode emoji representing the card's energy */
  emoji: string;
}

export type SpreadType = "daily" | "past-present-future" | "love" | "decision";

export interface TarotSpread {
  type: SpreadType;
  nameEs: string;
  positions: string[];
  description: string;
}

export interface TarotReading {
  spread: SpreadType;
  cards: DrawnCard[];
  timestamp: string;
}

export interface DrawnCard {
  card: TarotCard;
  position: string;
  reversed: boolean;
}

/* ============================================
   SPREADS (Tiradas)
   ============================================ */

export const SPREADS: Record<SpreadType, TarotSpread> = {
  daily: {
    type: "daily",
    nameEs: "Carta del Día",
    positions: ["Energía del día"],
    description: "Una carta que define la vibración de tu jornada.",
  },
  "past-present-future": {
    type: "past-present-future",
    nameEs: "Pasado · Presente · Futuro",
    positions: ["Lo que dejaste atrás", "Tu momento actual", "Lo que se abre ante ti"],
    description: "Tres cartas que mapean tu línea temporal energética.",
  },
  love: {
    type: "love",
    nameEs: "Lectura de Amor",
    positions: ["Tu energía", "La energía de la otra persona", "El puente entre ambos"],
    description: "Descifra las fuerzas invisibles que mueven tu conexión.",
  },
  decision: {
    type: "decision",
    nameEs: "Decisión Importante",
    positions: ["La situación actual", "Si eliges el camino A", "Si eliges el camino B"],
    description: "Ilumina las consecuencias energéticas de tus opciones.",
  },
};

/* ============================================
   MAJOR ARCANA (22 cards)
   ============================================ */

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: "The Fool", nameEs: "El Loco",
    arcana: "major", association: "Urano", element: "air",
    keywords: ["new beginnings", "freedom", "innocence"],
    keywordsEs: ["nuevos comienzos", "libertad", "inocencia"],
    meaningUpright: "Un salto de fe. El universo te invita a empezar algo sin saber el final. Confía.",
    meaningReversed: "Miedo a lo desconocido. Estás reteniendo un salto que tu alma pide dar.",
    emoji: "🃏",
  },
  {
    id: 1, name: "The Magician", nameEs: "El Mago",
    arcana: "major", association: "Mercurio", element: "air",
    keywords: ["manifestation", "willpower", "skill"],
    keywordsEs: ["manifestación", "voluntad", "habilidad"],
    meaningUpright: "Tienes todas las herramientas. Es momento de crear tu realidad con intención.",
    meaningReversed: "Manipulación o talento desperdiciado. ¿Estás usando tu poder para el bien?",
    emoji: "✨",
  },
  {
    id: 2, name: "The High Priestess", nameEs: "La Sacerdotisa",
    arcana: "major", association: "Luna", element: "water",
    keywords: ["intuition", "mystery", "inner voice"],
    keywordsEs: ["intuición", "misterio", "voz interior"],
    meaningUpright: "Tu intuición grita. Deja de buscar respuestas afuera; ya las tienes dentro.",
    meaningReversed: "Estás ignorando tu voz interior. El ruido externo ahoga tu sabiduría.",
    emoji: "🌙",
  },
  {
    id: 3, name: "The Empress", nameEs: "La Emperatriz",
    arcana: "major", association: "Venus", element: "earth",
    keywords: ["abundance", "nurturing", "sensuality"],
    keywordsEs: ["abundancia", "nutrición", "sensualidad"],
    meaningUpright: "Fertilidad en todo sentido. Ideas, proyectos y relaciones florecen con tu energía.",
    meaningReversed: "Descuido de ti misma. No puedes nutrir a otros con el vaso vacío.",
    emoji: "👑",
  },
  {
    id: 4, name: "The Emperor", nameEs: "El Emperador",
    arcana: "major", association: "Aries", element: "fire",
    keywords: ["authority", "structure", "leadership"],
    keywordsEs: ["autoridad", "estructura", "liderazgo"],
    meaningUpright: "Es hora de poner orden. Tu mundo necesita estructura y límites claros.",
    meaningReversed: "Control excesivo o tiranía. El poder sin empatía destruye lo que construye.",
    emoji: "🏛️",
  },
  {
    id: 5, name: "The Hierophant", nameEs: "El Hierofante",
    arcana: "major", association: "Tauro", element: "earth",
    keywords: ["tradition", "teaching", "beliefs"],
    keywordsEs: ["tradición", "enseñanza", "creencias"],
    meaningUpright: "Busca un mentor o vuelve a tus raíces. Hay sabiduría en lo tradicional.",
    meaningReversed: "Rebeldía necesaria. Algunas reglas ya no te sirven. Crea las tuyas.",
    emoji: "📿",
  },
  {
    id: 6, name: "The Lovers", nameEs: "Los Amantes",
    arcana: "major", association: "Géminis", element: "air",
    keywords: ["love", "choice", "alignment"],
    keywordsEs: ["amor", "elección", "alineación"],
    meaningUpright: "Una decisión importante de corazón. Elige lo que te alinea, no lo que te conviene.",
    meaningReversed: "Desalineación en una relación o decisión. ¿Estás siendo honesta contigo?",
    emoji: "💞",
  },
  {
    id: 7, name: "The Chariot", nameEs: "El Carro",
    arcana: "major", association: "Cáncer", element: "water",
    keywords: ["determination", "victory", "control"],
    keywordsEs: ["determinación", "victoria", "control"],
    meaningUpright: "Avanza con todo. La victoria es tuya si mantienes el rumbo con voluntad.",
    meaningReversed: "Fuerzas internas en guerra. Antes de avanzar, alinea tus contradicciones.",
    emoji: "🏆",
  },
  {
    id: 8, name: "Strength", nameEs: "La Fuerza",
    arcana: "major", association: "Leo", element: "fire",
    keywords: ["courage", "patience", "inner strength"],
    keywordsEs: ["coraje", "paciencia", "fuerza interior"],
    meaningUpright: "Tu poder no está en la agresión sino en la serenidad. Doma tu bestia interior con amor.",
    meaningReversed: "Inseguridad o fuerza bruta. Estás buscando poder donde no lo hay.",
    emoji: "🦁",
  },
  {
    id: 9, name: "The Hermit", nameEs: "El Ermitaño",
    arcana: "major", association: "Virgo", element: "earth",
    keywords: ["solitude", "wisdom", "introspection"],
    keywordsEs: ["soledad", "sabiduría", "introspección"],
    meaningUpright: "Retírate del ruido. Este es un momento sagrado de búsqueda interior.",
    meaningReversed: "Aislamiento excesivo o miedo a estar sola contigo misma.",
    emoji: "🏔️",
  },
  {
    id: 10, name: "Wheel of Fortune", nameEs: "La Rueda de la Fortuna",
    arcana: "major", association: "Júpiter", element: "fire",
    keywords: ["cycles", "fate", "turning point"],
    keywordsEs: ["ciclos", "destino", "punto de inflexión"],
    meaningUpright: "El universo gira a tu favor. Un cambio de ciclo poderoso está en marcha.",
    meaningReversed: "Resistencia al cambio. La rueda gira aunque no quieras. Fluye.",
    emoji: "🎡",
  },
  {
    id: 11, name: "Justice", nameEs: "La Justicia",
    arcana: "major", association: "Libra", element: "air",
    keywords: ["truth", "fairness", "karma"],
    keywordsEs: ["verdad", "equidad", "karma"],
    meaningUpright: "La verdad sale a la luz. Toma decisiones justas, el karma está activo.",
    meaningReversed: "Injusticia o deshonestidad. ¿Hay algo que no estás viendo con claridad?",
    emoji: "⚖️",
  },
  {
    id: 12, name: "The Hanged Man", nameEs: "El Colgado",
    arcana: "major", association: "Neptuno", element: "water",
    keywords: ["surrender", "new perspective", "pause"],
    keywordsEs: ["rendición", "nueva perspectiva", "pausa"],
    meaningUpright: "Suelta el control. La respuesta aparece cuando dejas de forzar.",
    meaningReversed: "Resistencia a soltar. Estás atrapada en un patrón que ya no sirve.",
    emoji: "🔄",
  },
  {
    id: 13, name: "Death", nameEs: "La Muerte",
    arcana: "major", association: "Escorpio", element: "water",
    keywords: ["transformation", "endings", "rebirth"],
    keywordsEs: ["transformación", "finales", "renacimiento"],
    meaningUpright: "Algo muere para que algo nuevo nazca. No temas el fin; es tu metamorfosis.",
    meaningReversed: "Negas un final necesario. Lo que no dejas ir te arrastra.",
    emoji: "🦋",
  },
  {
    id: 14, name: "Temperance", nameEs: "La Templanza",
    arcana: "major", association: "Sagitario", element: "fire",
    keywords: ["balance", "harmony", "patience"],
    keywordsEs: ["equilibrio", "armonía", "paciencia"],
    meaningUpright: "Encuentra el punto medio. La magia está en la mezcla perfecta de tus opuestos.",
    meaningReversed: "Exceso o desequilibrio. Algo está fuera de proporción en tu vida.",
    emoji: "⚗️",
  },
  {
    id: 15, name: "The Devil", nameEs: "El Diablo",
    arcana: "major", association: "Capricornio", element: "earth",
    keywords: ["shadow", "attachment", "illusion"],
    keywordsEs: ["sombra", "apego", "ilusión"],
    meaningUpright: "Mira tu sombra de frente. Esas cadenas que sientes… tú tienes la llave.",
    meaningReversed: "Liberación de un vicio o relación tóxica. Estás rompiendo tus cadenas.",
    emoji: "⛓️",
  },
  {
    id: 16, name: "The Tower", nameEs: "La Torre",
    arcana: "major", association: "Marte", element: "fire",
    keywords: ["upheaval", "revelation", "liberation"],
    keywordsEs: ["derrumbe", "revelación", "liberación"],
    meaningUpright: "Lo que se cae necesitaba caer. La destrucción es la primera fase de tu reconstrucción.",
    meaningReversed: "La destrucción ya pasó. Es momento de recoger las piezas y reconstruir mejor.",
    emoji: "⚡",
  },
  {
    id: 17, name: "The Star", nameEs: "La Estrella",
    arcana: "major", association: "Acuario", element: "air",
    keywords: ["hope", "inspiration", "healing"],
    keywordsEs: ["esperanza", "inspiración", "sanación"],
    meaningUpright: "Después de la tormenta viene la estrella. Estás sanando y el universo lo celebra.",
    meaningReversed: "Pérdida de fe. Recuerda: siempre hay luz después de la oscuridad más profunda.",
    emoji: "⭐",
  },
  {
    id: 18, name: "The Moon", nameEs: "La Luna",
    arcana: "major", association: "Piscis", element: "water",
    keywords: ["illusion", "subconscious", "dreams"],
    keywordsEs: ["ilusión", "subconsciente", "sueños"],
    meaningUpright: "No todo es lo que parece. Tu subconsciente tiene mensajes que necesitas escuchar.",
    meaningReversed: "Claridad emerge de la confusión. Los miedos pierden poder cuando los nombras.",
    emoji: "🌕",
  },
  {
    id: 19, name: "The Sun", nameEs: "El Sol",
    arcana: "major", association: "Sol", element: "fire",
    keywords: ["joy", "vitality", "success"],
    keywordsEs: ["alegría", "vitalidad", "éxito"],
    meaningUpright: "¡Brilla! Todo se alinea. Éxito, alegría y vitalidad están de tu lado.",
    meaningReversed: "Alegría bloqueada. ¿Qué te impide disfrutar lo que ya lograste?",
    emoji: "☀️",
  },
  {
    id: 20, name: "Judgement", nameEs: "El Juicio",
    arcana: "major", association: "Plutón", element: "fire",
    keywords: ["rebirth", "calling", "absolution"],
    keywordsEs: ["renacimiento", "llamado", "absolución"],
    meaningUpright: "Un llamado superior. Es hora de responder a tu propósito real.",
    meaningReversed: "Autoduda o ignoras tu llamado. El juicio más duro es el que te haces tú.",
    emoji: "📯",
  },
  {
    id: 21, name: "The World", nameEs: "El Mundo",
    arcana: "major", association: "Saturno", element: "earth",
    keywords: ["completion", "achievement", "wholeness"],
    keywordsEs: ["completitud", "logro", "plenitud"],
    meaningUpright: "Ciclo completo. Has llegado. Celebra antes de empezar el siguiente nivel.",
    meaningReversed: "Casi llegas pero algo falta. Revisa qué hilo suelto no has cerrado.",
    emoji: "🌍",
  },
];

/* ============================================
   MINOR ARCANA GENERATOR
   (56 cards across 4 suits)
   ============================================ */

const SUIT_META = {
  wands: { element: "fire" as const, emoji: "🔥", nameEs: "Bastos", keywords: ["passion", "action", "creativity"] },
  cups: { element: "water" as const, emoji: "💧", nameEs: "Copas", keywords: ["emotion", "love", "intuition"] },
  swords: { element: "air" as const, emoji: "⚔️", nameEs: "Espadas", keywords: ["thought", "conflict", "truth"] },
  pentacles: { element: "earth" as const, emoji: "💰", nameEs: "Oros", keywords: ["material", "work", "health"] },
};

const COURT_NAMES = {
  11: { en: "Page", es: "Sota" },
  12: { en: "Knight", es: "Caballero" },
  13: { en: "Queen", es: "Reina" },
  14: { en: "King", es: "Rey" },
};

function generateMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  let id = 22; // Start after Major Arcana

  for (const [suit, meta] of Object.entries(SUIT_META)) {
    for (let num = 1; num <= 14; num++) {
      const isCourt = num > 10;
      const court = isCourt ? COURT_NAMES[num as keyof typeof COURT_NAMES] : null;
      const cardName = isCourt
        ? `${court!.en} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`
        : num === 1
          ? `Ace of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`
          : `${num} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
      const cardNameEs = isCourt
        ? `${court!.es} de ${meta.nameEs}`
        : num === 1
          ? `As de ${meta.nameEs}`
          : `${num} de ${meta.nameEs}`;

      cards.push({
        id: id++,
        name: cardName,
        nameEs: cardNameEs,
        arcana: "minor",
        suit: suit as TarotCard["suit"],
        number: num,
        association: meta.nameEs,
        element: meta.element,
        keywords: meta.keywords,
        keywordsEs: meta.keywords, // Will be enriched later
        meaningUpright: `Energía ${meta.element} en nivel ${num}. Usa esta fuerza con intención.`,
        meaningReversed: `Bloqueo en energía ${meta.element}. Revisa qué está frenando tu flujo.`,
        emoji: meta.emoji,
      });
    }
  }

  return cards;
}

export const MINOR_ARCANA = generateMinorArcana();

/* ============================================
   FULL DECK — All 78 cards
   ============================================ */

export const FULL_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

/* ============================================
   DRAWING ENGINE — Card selection logic
   ============================================ */

/**
 * Draws N random cards from the deck, optionally with reversals.
 * Uses crypto.getRandomValues for truly random selection.
 */
export function drawCards(
  count: number,
  options: {
    /** Probability (0-1) that a card appears reversed. Default 0.3 */
    reversalChance?: number;
    /** Only draw Major Arcana. Default false */
    majorOnly?: boolean;
    /** Exclude specific card IDs (to prevent duplicates across readings) */
    exclude?: number[];
  } = {}
): DrawnCard[] {
  const {
    reversalChance = 0.3,
    majorOnly = false,
    exclude = [],
  } = options;

  let pool = majorOnly
    ? MAJOR_ARCANA.filter((c) => !exclude.includes(c.id))
    : FULL_DECK.filter((c) => !exclude.includes(c.id));

  // Fisher-Yates shuffle with crypto randomness
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map((card, idx) => ({
    card,
    position: `Position ${idx + 1}`,
    reversed: Math.random() < reversalChance,
  }));
}

/**
 * Performs a complete tarot reading for a given spread type.
 */
export function performReading(spreadType: SpreadType): TarotReading {
  const spread = SPREADS[spreadType];
  const drawn = drawCards(spread.positions.length);

  return {
    spread: spreadType,
    cards: drawn.map((d, i) => ({
      ...d,
      position: spread.positions[i],
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get today's daily card using date-based seed.
 * Same user on same day always gets the same card.
 */
export function getDailyCard(userId: string, date?: Date): DrawnCard {
  const d = date || new Date();
  const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const seed = hashString(`${userId}-${dateStr}`);
  
  const cardIndex = Math.abs(seed) % FULL_DECK.length;
  const reversed = (Math.abs(seed) % 100) < 30; // 30% reversal chance

  return {
    card: FULL_DECK[cardIndex],
    position: "Energía del día",
    reversed,
  };
}

/**
 * Simple string hash for deterministic daily cards.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}
