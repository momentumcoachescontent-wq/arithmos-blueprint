/**
 * Arithmos V3 — Daily Planetary Transits
 * 
 * Generates static / calculated insights based on current astrological weather.
 */

export interface DailyTransit {
  planet: string;
  sign: string;
  emoji: string;
  message: string;
  vibe: "intense" | "calm" | "action" | "mystic";
}

// Pseudo-ephemeris engine for Daily Transits
// In a real app, this would query a SWISS Ephemeris API.
// We are faking the current cosmic weather based on the current date for the PoC.
export function getDailyTransits(date: Date = new Date()): DailyTransit[] {
  const day = date.getDate();
  const transits: DailyTransit[] = [];

  // Luna (Changes every 2.5 days, we simulate based on modulo)
  const moonSigns = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"];
  const moonIndex = (Math.floor(day / 2.5) + date.getMonth()) % 12;
  const currentMoonSign = moonSigns[moonIndex];

  transits.push({
    planet: "Luna",
    sign: currentMoonSign,
    emoji: "🌙",
    message: `La Luna transita por ${currentMoonSign}. Tus emociones están a flor de piel. Siente sin pedir permiso.`,
    vibe: "mystic"
  });

  // Mercurio
  if (day % 7 === 0) {
    transits.push({
      planet: "Mercurio Rx",
      sign: "Sombra",
      emoji: "🪐",
      message: "Atención: Mercurio está estacionario. Cuida cómo te comunicas hoy, las palabras cortan.",
      vibe: "warning" as const
    });
  } else {
    transits.push({
      planet: "Mercurio",
      sign: "Directo",
      emoji: "🗣️",
      message: "Comunicación fluida. Es el día de soltar tu verdad al universo.",
      vibe: "action"
    });
  }

  // Sol
  transits.push({
    planet: "Sol",
    sign: "Tu vitalidad",
    emoji: "☀️",
    message: "El Sol te pide que tomes el centro del escenario. Brilla sin disculparte.",
    vibe: "intense"
  });

  return transits;
}
