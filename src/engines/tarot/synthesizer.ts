/**
 * Arithmos V3.3 — Tarot Synthesis Engine
 * 
 * Generates holistic, high-authority interpretations for multi-card spreads.
 * Analyzes arcana density, elemental balance, and spread-specific narrative.
 */

import { type TarotReading, type DrawnCard } from "./deck";

export function generateSynthesis(reading: TarotReading): string {
  const { cards, spread } = reading;
  if (cards.length < 2) return "";

  // 1. Arcana Analysis
  const majorCount = cards.filter(c => c.card.arcana === "major").length;
  const isKarmic = majorCount >= 2;

  // 2. Elemental Analysis
  const elements = cards.map(c => c.card.element);
  const elementCounts: Record<string, number> = {};
  elements.forEach(el => {
    elementCounts[el] = (elementCounts[el] || 0) + 1;
  });

  const dominantElement = Object.entries(elementCounts).find(([_, count]) => count >= 2)?.[0];

  // 3. Narrative Synthesis based on Spread Type
  switch (spread) {
    case "past-present-future":
      return buildTimelineSynthesis(cards, isKarmic, dominantElement);
    case "love":
      return buildLoveSynthesis(cards, isKarmic, dominantElement);
    case "decision":
      return buildDecisionSynthesis(cards, isKarmic, dominantElement);
    default:
      return "Las cartas se alinean para mostrar un patrón de transformación. Observa cómo cada energía alimenta a la siguiente.";
  }
}

function buildTimelineSynthesis(cards: DrawnCard[], isKarmic: boolean, element?: string): string {
  const [past, present, future] = cards;
  
  let intro = isKarmic 
    ? "Estás atravesando un ciclo de destino profundo. "
    : "Tu línea emocional muestra un flujo claro de causa y efecto. ";

  let elementInsight = "";
  if (element === "fuego") elementInsight = "El fuego domina tu camino, indicando que el cambio vendrá a través de la pasión y la acción directa. ";
  if (element === "agua") elementInsight = "El predominio del agua sugiere que este ciclo es sanador y profundamente intuitivo. ";
  if (element === "aire") elementInsight = "El aire indica que la claridad mental y la verdad serán tus mejores herramientas. ";
  if (element === "tierra") elementInsight = "La tierra estabiliza tu lectura, sugiriendo que los resultados serán tangibles y sólidos. ";

  return `${intro}${elementInsight}Lo que dejaste atrás con ${past.card.nameEs} ha forjado la vibración de ${present.card.nameEs} que experimentas hoy. La clave está en transmutar esta energía para recibir el regalo de ${future.card.nameEs} que el universo abre ante ti.`;
}

function buildLoveSynthesis(cards: DrawnCard[], isKarmic: boolean, element?: string): string {
  const [you, them, bridge] = cards;
  
  let intro = isKarmic
    ? "Esta conexión tiene un propósito de alma que trasciende lo cotidiano. "
    : "Hay una dinámica de espejo muy clara entre ustedes. ";

  return `${intro}Mientras tu energía vibra con ${you.card.nameEs}, la otra parte se encuentra navegando la frecuencia de ${them.card.nameEs}. El puente de conexión, representado por ${bridge.card.nameEs}, es el espacio sagrado donde la unión realmente ocurre. No fuerces; permite que este puente sea el que dicte el ritmo.`;
}

function buildDecisionSynthesis(cards: DrawnCard[], isKarmic: boolean, element?: string): string {
  const [situation, pathA, pathB] = cards;
  
  return `Tu situación actual, marcada por ${situation.card.nameEs}, es el anclaje desde el cual debes elegir. El Camino A te propone la energía de ${pathA.card.nameEs}, mientras que el Camino B abre la frecuencia de ${pathB.card.nameEs}. La síntesis cósmica sugiere que no hay una opción 'correcta', sino una que se alinea más con tu verdad interna de este momento.`;
}
