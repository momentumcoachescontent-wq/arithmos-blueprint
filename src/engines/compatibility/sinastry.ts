/**
 * Arithmos V3 — Compatibility Engine (Sinastría)
 *
 * Motor que calcula la compatibilidad entre dos perfiles combinando:
 * 1. Numerología (Camino de vida)
 * 2. Astrología básica (Signos solares y elementos)
 */

import { ARCHETYPES } from "@/hooks/useProfile";

/* ====================================================================
   1. NUMEROLOGY CONSTANTS & LOGIC
   ==================================================================== */

// Reglas clásicas de compatibilidad numerológica (Camino de Vida)
// Se puntúa de 0 a 100.
const NUMEROLOGY_MATCHES: Record<number, Record<number, number>> = {
  1: { 1: 50, 2: 70, 3: 80, 4: 40, 5: 90, 6: 30, 7: 85, 8: 60, 9: 80, 11: 75, 22: 45, 33: 50 },
  2: { 1: 70, 2: 80, 3: 60, 4: 90, 5: 40, 6: 85, 7: 50, 8: 95, 9: 60, 11: 90, 22: 95, 33: 85 },
  3: { 1: 80, 2: 60, 3: 75, 4: 40, 5: 85, 6: 80, 7: 35, 8: 60, 9: 90, 11: 70, 22: 45, 33: 85 },
  4: { 1: 40, 2: 90, 3: 40, 4: 70, 5: 35, 6: 85, 7: 95, 8: 85, 9: 45, 11: 80, 22: 90, 33: 70 },
  5: { 1: 90, 2: 40, 3: 85, 4: 35, 5: 80, 6: 45, 7: 85, 8: 50, 9: 75, 11: 65, 22: 40, 33: 50 },
  6: { 1: 30, 2: 85, 3: 80, 4: 85, 5: 45, 6: 75, 7: 40, 8: 80, 9: 90, 11: 85, 22: 80, 33: 95 },
  7: { 1: 85, 2: 50, 3: 35, 4: 95, 5: 85, 6: 40, 7: 80, 8: 55, 9: 65, 11: 90, 22: 85, 33: 60 },
  8: { 1: 60, 2: 95, 3: 60, 4: 85, 5: 50, 6: 80, 7: 55, 8: 70, 9: 40, 11: 95, 22: 85, 33: 75 },
  9: { 1: 80, 2: 60, 3: 90, 4: 45, 5: 75, 6: 90, 7: 65, 8: 40, 9: 80, 11: 85, 22: 50, 33: 95 },
  11: { 1: 75, 2: 90, 3: 70, 4: 80, 5: 65, 6: 85, 7: 90, 8: 95, 9: 85, 11: 90, 22: 80, 33: 95 },
  22: { 1: 45, 2: 95, 3: 45, 4: 90, 5: 40, 6: 80, 7: 85, 8: 85, 9: 50, 11: 80, 22: 85, 33: 75 },
  33: { 1: 50, 2: 85, 3: 85, 4: 70, 5: 50, 6: 95, 7: 60, 8: 75, 9: 95, 11: 95, 22: 75, 33: 90 },
};

function getNumerologyScore(path1: number, path2: number): number {
  if (NUMEROLOGY_MATCHES[path1] && NUMEROLOGY_MATCHES[path1][path2]) {
    return NUMEROLOGY_MATCHES[path1][path2];
  }
  // Fallback if numbers are strange
  return 60;
}

/* ====================================================================
   2. ASTROLOGY (ELEMENTAL) LOGIC
   ==================================================================== */

const ELEMENTS: Record<string, "Fuego" | "Tierra" | "Aire" | "Agua"> = {
  Aries: "Fuego", Leo: "Fuego", Sagitario: "Fuego",
  Tauro: "Tierra", Virgo: "Tierra", Capricornio: "Tierra",
  Géminis: "Aire", Libra: "Aire", Acuario: "Aire",
  Cáncer: "Agua", Escorpio: "Agua", Piscis: "Agua"
};

// Fire/Air and Earth/Water are traditionally harmonious (+20)
// Same element is very harmonious (+15)
// Friction otherwise (-10 to 0)
function getElementalScore(sign1: string, sign2: string): number {
  const e1 = ELEMENTS[sign1];
  const e2 = ELEMENTS[sign2];

  if (!e1 || !e2) return 50; // Fallback neutral

  if (e1 === e2) return 85; 
  if ((e1 === "Fuego" && e2 === "Aire") || (e1 === "Aire" && e2 === "Fuego")) return 90;
  if ((e1 === "Tierra" && e2 === "Agua") || (e1 === "Agua" && e2 === "Tierra")) return 90;
  
  if ((e1 === "Fuego" && e2 === "Agua") || (e1 === "Agua" && e2 === "Fuego")) return 40; // Steam/Evaporation
  if ((e1 === "Tierra" && e2 === "Aire") || (e1 === "Aire" && e2 === "Tierra")) return 50; // Dust storm

  return 60; // Fuego/Tierra or Agua/Aire (Moderate tension)
}

/* ====================================================================
   3. ENGINE INTEGRATION
   ==================================================================== */

export interface CompatibilityResult {
  score: number;
  numerologyScore: number;
  astrologyScore: number;
  vibe: string;
  advice: string;
  strengths: string[];
  challenges: string[];
}

export function calculateCompatibility(
  personA: { lifePath: number; sunSign: string; name: string },
  personB: { lifePath: number; sunSign: string; name: string }
): CompatibilityResult {
  // 1. Calculations
  const numScore = getNumerologyScore(personA.lifePath, personB.lifePath);
  const astroScore = getElementalScore(personA.sunSign, personB.sunSign);
  
  // Weighting: 60% numerology, 40% astrology (sun sign level)
  const score = Math.round((numScore * 0.6) + (astroScore * 0.4));

  // 2. Vibe mapping
  let vibe = "Conexión en Desarrollo 🌱";
  if (score >= 88) vibe = "Llama Gemela 🔥";
  else if (score >= 75) vibe = "Alineación Fluida 🌊";
  else if (score >= 60) vibe = "Conexión Kármica 🔄";
  else vibe = "Maestros del Espejo 🪞"; // euphemism for low compatibility

  // 3. Advice generation (Gen Z Tone)
  let advice = "";
  const strengths: string[] = [];
  const challenges: string[] = [];

  const archA = ARCHETYPES[personA.lifePath]?.name || `Camino ${personA.lifePath}`;
  const archB = ARCHETYPES[personB.lifePath]?.name || `Camino ${personB.lifePath}`;

  if (score >= 80) {
    strengths.push("Se entienden casi sin hablar");
    strengths.push("El flujo de energía retroalimenta a ambxs");
    advice = `Esta conexión es magnética, bbs. La mezcla de ${archA} y ${archB} crea una frecuencia altísima. Confía en el flujo orgánico, porque el universo literalmente los quiere cerca.`;
  } else if (score >= 60) {
    strengths.push("Hay espacio para aprender del otro");
    challenges.push("Pueden desentenderse en momentos de estrés");
    advice = `Tienen energía Kármica. No de las que destruyen, de las que enseñan. Tú (${archA}) ves el mundo diferente a ${personB.name} (${archB}). Usen eso para expandirse, no para chocar. Comunicación directa es clave.`;
  } else {
    challenges.push("Operan en frecuencias muy distintas");
    challenges.push("Se necesita mucha empatía activa");
    advice = `Conexión de Espejo. Significa que van a presionar los botones del otro. No es imposible, pero requiere madurez. Tú estás vibrando como ${archA} y la otra energía pide algo distinto. Si eligen esta ruta, requiere trabajo consciente.`;
  }

  // Astrological flavor if we have element data
  const e1 = ELEMENTS[personA.sunSign];
  const e2 = ELEMENTS[personB.sunSign];
  if (e1 && e2) {
    if (e1 === e2) strengths.push(`Comparten la misma esencia (${e1})`);
    if ((e1 === "Fuego" && e2 === "Agua") || (e1 === "Agua" && e2 === "Fuego")) {
      challenges.push(`La intensidad emocional (${e1 === "Agua" ? personA.name : personB.name}) puede apagar o hervir al otro`);
    }
  }

  return {
    score,
    numerologyScore: numScore,
    astrologyScore: astroScore,
    vibe,
    advice,
    strengths,
    challenges,
  };
}
