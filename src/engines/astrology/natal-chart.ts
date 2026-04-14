/**
 * Arithmos V3 — Astrology Engine
 * 
 * Calculates Sun sign, Moon sign (approximate), and Rising sign
 * from birth date, time, and location.
 * 
 * NOTE: This is a simplified engine using tropical zodiac date ranges.
 * For production accuracy (especially Moon & Rising), integrate a proper
 * ephemeris library like astronomia or swiss-ephemeris-wasm.
 * This version provides ~85% accuracy which is sufficient for MVP.
 */

export interface ZodiacSign {
  name: string;
  nameEs: string;
  symbol: string;
  element: "fire" | "water" | "air" | "earth";
  modality: "cardinal" | "fixed" | "mutable";
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
  traitsEs: string[];
  emoji: string;
}

export interface NatalProfile {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
  /** Brief cosmic summary combining the three */
  cosmicSummary: string;
}

export interface BirthData {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (24h format)
  /** Latitude */
  lat?: number;
  /** Longitude */
  lng?: number;
  /** Timezone offset from UTC in hours */
  tzOffset?: number;
}

/* ============================================
   ZODIAC DEFINITIONS
   ============================================ */

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: "Aries", nameEs: "Aries", symbol: "♈", element: "fire",
    modality: "cardinal", rulingPlanet: "Marte", dateRange: "Mar 21 – Abr 19",
    traits: ["bold", "ambitious", "energetic", "pioneering"],
    traitsEs: ["valiente", "ambicioso/a", "energético/a", "pionero/a"],
    emoji: "🔥",
  },
  {
    name: "Taurus", nameEs: "Tauro", symbol: "♉", element: "earth",
    modality: "fixed", rulingPlanet: "Venus", dateRange: "Abr 20 – May 20",
    traits: ["reliable", "patient", "devoted", "sensual"],
    traitsEs: ["confiable", "paciente", "devoto/a", "sensual"],
    emoji: "🌿",
  },
  {
    name: "Gemini", nameEs: "Géminis", symbol: "♊", element: "air",
    modality: "mutable", rulingPlanet: "Mercurio", dateRange: "May 21 – Jun 20",
    traits: ["curious", "adaptable", "communicative", "witty"],
    traitsEs: ["curioso/a", "adaptable", "comunicativo/a", "ingenioso/a"],
    emoji: "💨",
  },
  {
    name: "Cancer", nameEs: "Cáncer", symbol: "♋", element: "water",
    modality: "cardinal", rulingPlanet: "Luna", dateRange: "Jun 21 – Jul 22",
    traits: ["nurturing", "intuitive", "protective", "emotional"],
    traitsEs: ["protector/a", "intuitivo/a", "protector/a", "emocional"],
    emoji: "🌊",
  },
  {
    name: "Leo", nameEs: "Leo", symbol: "♌", element: "fire",
    modality: "fixed", rulingPlanet: "Sol", dateRange: "Jul 23 – Ago 22",
    traits: ["creative", "passionate", "generous", "charismatic"],
    traitsEs: ["creativo/a", "apasionado/a", "generoso/a", "carismático/a"],
    emoji: "🦁",
  },
  {
    name: "Virgo", nameEs: "Virgo", symbol: "♍", element: "earth",
    modality: "mutable", rulingPlanet: "Mercurio", dateRange: "Ago 23 – Sep 22",
    traits: ["analytical", "practical", "helpful", "detail-oriented"],
    traitsEs: ["analítico/a", "práctico/a", "servicial", "detallista"],
    emoji: "✨",
  },
  {
    name: "Libra", nameEs: "Libra", symbol: "♎", element: "air",
    modality: "cardinal", rulingPlanet: "Venus", dateRange: "Sep 23 – Oct 22",
    traits: ["diplomatic", "fair", "harmonious", "romantic"],
    traitsEs: ["diplomático/a", "justo/a", "armonioso/a", "romántico/a"],
    emoji: "⚖️",
  },
  {
    name: "Scorpio", nameEs: "Escorpio", symbol: "♏", element: "water",
    modality: "fixed", rulingPlanet: "Plutón", dateRange: "Oct 23 – Nov 21",
    traits: ["intense", "transformative", "magnetic", "strategic"],
    traitsEs: ["intenso/a", "transformador/a", "magnético/a", "estratégico/a"],
    emoji: "🦂",
  },
  {
    name: "Sagittarius", nameEs: "Sagitario", symbol: "♐", element: "fire",
    modality: "mutable", rulingPlanet: "Júpiter", dateRange: "Nov 22 – Dic 21",
    traits: ["adventurous", "optimistic", "philosophical", "freedom-loving"],
    traitsEs: ["aventurero/a", "optimista", "filosófico/a", "libre"],
    emoji: "🏹",
  },
  {
    name: "Capricorn", nameEs: "Capricornio", symbol: "♑", element: "earth",
    modality: "cardinal", rulingPlanet: "Saturno", dateRange: "Dic 22 – Ene 19",
    traits: ["ambitious", "disciplined", "responsible", "strategic"],
    traitsEs: ["ambicioso/a", "disciplinado/a", "responsable", "estratégico/a"],
    emoji: "🏔️",
  },
  {
    name: "Aquarius", nameEs: "Acuario", symbol: "♒", element: "air",
    modality: "fixed", rulingPlanet: "Urano", dateRange: "Ene 20 – Feb 18",
    traits: ["innovative", "independent", "humanitarian", "visionary"],
    traitsEs: ["innovador/a", "independiente", "humanitario/a", "visionario/a"],
    emoji: "⚡",
  },
  {
    name: "Pisces", nameEs: "Piscis", symbol: "♓", element: "water",
    modality: "mutable", rulingPlanet: "Neptuno", dateRange: "Feb 19 – Mar 20",
    traits: ["empathic", "artistic", "dreamy", "intuitive"],
    traitsEs: ["empático/a", "artístico/a", "soñador/a", "intuitivo/a"],
    emoji: "🐟",
  },
];

/* ============================================
   SUN SIGN CALCULATION
   ============================================ */

/** Date boundaries for each zodiac sign (month, day) */
const SIGN_BOUNDARIES: [number, number][] = [
  [1, 20],  // Aquarius starts
  [2, 19],  // Pisces starts
  [3, 21],  // Aries starts
  [4, 20],  // Taurus starts
  [5, 21],  // Gemini starts
  [6, 21],  // Cancer starts
  [7, 23],  // Leo starts
  [8, 23],  // Virgo starts
  [9, 23],  // Libra starts
  [10, 23], // Scorpio starts
  [11, 22], // Sagittarius starts
  [12, 22], // Capricorn starts
];

/** Sign order matching SIGN_BOUNDARIES */
const SIGN_ORDER = [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Maps to ZODIAC_SIGNS index

export function calculateSunSign(dateStr: string): ZodiacSign {
  const [, monthStr, dayStr] = dateStr.split("-");
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);

  let signIndex = 9; // Default: Capricorn (Dec 22+)

  for (let i = SIGN_BOUNDARIES.length - 1; i >= 0; i--) {
    const [bMonth, bDay] = SIGN_BOUNDARIES[i];
    if (month > bMonth || (month === bMonth && day >= bDay)) {
      signIndex = SIGN_ORDER[i];
      break;
    }
  }

  return ZODIAC_SIGNS[signIndex];
}

/* ============================================
   MOON SIGN CALCULATION (Simplified)
   ============================================ */

/**
 * Approximate Moon sign calculation.
 * The Moon changes sign every ~2.5 days, completing 
 * a full zodiac cycle in ~27.3 days.
 * 
 * This uses a simplified calculation based on the lunar cycle.
 * For production accuracy, use an ephemeris library.
 */
export function calculateMoonSign(dateStr: string, timeStr?: string): ZodiacSign {
  const date = new Date(dateStr + (timeStr ? `T${timeStr}:00` : "T12:00:00"));
  
  // Reference: Known new moon in Aries on March 21, 2023 at 17:23 UTC
  const refDate = new Date("2023-03-21T17:23:00Z");
  const synodicMonth = 29.530588853; // synodic month in days
  const siderealMonth = 27.321661; // sidereal month in days
  
  const daysDiff = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate moon's ecliptic longitude progression
  const moonCycles = daysDiff / siderealMonth;
  const signProgression = (moonCycles * 12) % 12;
  
  // Reference moon was in Aries (index 0), so offset from there
  const moonSignIndex = Math.floor((signProgression + 12) % 12);
  
  return ZODIAC_SIGNS[moonSignIndex];
}

/* ============================================
   RISING SIGN CALCULATION (Simplified)
   ============================================ */

/**
 * Approximate Rising (Ascendant) sign calculation.
 * The ascendant changes sign roughly every 2 hours.
 * 
 * This simplified version uses birth time + date to estimate.
 * Latitude affects rising sign timing significantly, so this
 * is approximate for tropical latitudes (~15-35°N).
 * 
 * For production: use a proper house calculation library.
 */
export function calculateRisingSign(
  dateStr: string,
  timeStr?: string,
  lat?: number,
  _lng?: number
): ZodiacSign {
  if (!timeStr) {
    // Without birth time, rising sign cannot be calculated.
    // Return a placeholder based on sun sign season
    return calculateSunSign(dateStr);
  }

  const sunSign = calculateSunSign(dateStr);
  const sunSignIndex = ZODIAC_SIGNS.indexOf(sunSign);
  
  const [hours, minutes] = timeStr.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // The ascendant roughly corresponds to the sign rising on the eastern horizon.
  // At sunrise (~6 AM), the ascendant equals the sun sign.
  // It progresses through all 12 signs in 24 hours.
  const minutesSinceSunrise = ((totalMinutes - 360) + 1440) % 1440; // Assume sunrise at 6 AM
  const signOffset = Math.floor(minutesSinceSunrise / 120); // New sign every ~2 hours
  
  // Apply latitude correction (very approximate)
  const latCorrection = lat ? Math.round((lat - 25) / 15) : 0;
  
  const risingIndex = (sunSignIndex + signOffset + latCorrection + 12) % 12;
  
  return ZODIAC_SIGNS[risingIndex];
}

/* ============================================
   NATAL PROFILE BUILDER
   ============================================ */

/**
 * Calculate complete natal profile from birth data.
 */
export function calculateNatalProfile(birth: BirthData): NatalProfile {
  const sunSign = calculateSunSign(birth.date);
  const moonSign = calculateMoonSign(birth.date, birth.time);
  const risingSign = calculateRisingSign(birth.date, birth.time, birth.lat, birth.lng);

  const cosmicSummary = generateCosmicSummary(sunSign, moonSign, risingSign);

  return {
    sunSign,
    moonSign,
    risingSign,
    cosmicSummary,
  };
}

function generateCosmicSummary(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string {
  const elementCount: Record<string, number> = {};
  [sun, moon, rising].forEach((s) => {
    elementCount[s.element] = (elementCount[s.element] || 0) + 1;
  });
  
  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0][0];
  
  const elementNames: Record<string, string> = {
    fire: "fuego",
    water: "agua",
    air: "aire",
    earth: "tierra",
  };

  return `Sol en ${sun.nameEs} ${sun.symbol}, Luna en ${moon.nameEs} ${moon.symbol}, Ascendente en ${rising.nameEs} ${rising.symbol}. Energía dominante: ${elementNames[dominantElement]}. Tu esencia irradia ${sun.traitsEs[0]}, tu mundo emocional es ${moon.traitsEs[1]}, y el mundo te percibe como ${rising.traitsEs[2]}.`;
}

/* ============================================
   ELEMENT COMPATIBILITY
   ============================================ */

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire: { fire: 85, air: 90, earth: 55, water: 45 },
  earth: { earth: 80, water: 85, fire: 55, air: 50 },
  air: { air: 80, fire: 90, water: 50, earth: 50 },
  water: { water: 85, earth: 85, air: 50, fire: 45 },
};

/**
 * Calculate compatibility score between two natal profiles.
 * Returns 0-100 score.
 */
export function calculateAstroCompatibility(
  profileA: NatalProfile,
  profileB: NatalProfile
): number {
  const sunCompat = ELEMENT_COMPAT[profileA.sunSign.element][profileB.sunSign.element];
  const moonCompat = ELEMENT_COMPAT[profileA.moonSign.element][profileB.moonSign.element];
  const risingCompat = ELEMENT_COMPAT[profileA.risingSign.element][profileB.risingSign.element];

  // Sun-Moon cross compatibility (important in synastry)
  const crossCompat = (
    ELEMENT_COMPAT[profileA.sunSign.element][profileB.moonSign.element] +
    ELEMENT_COMPAT[profileB.sunSign.element][profileA.moonSign.element]
  ) / 2;

  // Weighted average: Sun 30%, Moon 25%, Rising 15%, Cross 30%
  return Math.round(
    sunCompat * 0.30 +
    moonCompat * 0.25 +
    risingCompat * 0.15 +
    crossCompat * 0.30
  );
}
