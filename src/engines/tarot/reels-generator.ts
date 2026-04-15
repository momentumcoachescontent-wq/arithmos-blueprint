/**
 * Arithmos V3 — Tarot Reels Generator
 * 
 * Generates punchy, short, and visceral interpretations for the vertical scroll mode.
 * Optimized for quick consumption and emotional impact (Cosmic Bestie Tone).
 */

import { drawCards, type DrawnCard } from "./deck";

export interface TarotReel {
  id: string;
  card: DrawnCard;
  title: string;
  hook: string;
  interpretation: string;
  vibe: "power" | "warning" | "love" | "manifest";
}

const HOOKS = [
  "Sis, no es casualidad que veas esto.",
  "El universo te tiene en 'visto' y esto es su respuesta.",
  "Para un segundo, esto es para ti.",
  "Tus astros están gritando y aquí tienes el porqué.",
  "Pov: Estás manifestando pero tus miedos no te dejan.",
];

export function generateDailyReels(count: number = 5): TarotReel[] {
  const cards = drawCards(count, { reversalChance: 0.4 });
  const reels: TarotReel[] = [];

  for (let i = 0; i < cards.length; i++) {
    const drawn = cards[i];
    const prevDrawn = i > 0 ? cards[i - 1] : null;
    
    // Determinamos el vibe basado en el arcano o el palo
    let vibe: TarotReel["vibe"] = "manifest";
    if (drawn.card.suit === "swords") vibe = "warning";
    if (drawn.card.suit === "cups" || drawn.card.id === 6) vibe = "love";
    if (drawn.card.suit === "wands" || drawn.card.id === 1) vibe = "power";

    // Generamos un título dinámico
    const title = `${drawn.card.nameEs}${drawn.reversed ? " (Invertida)" : ""}`;
    
    // Narrativa Relacional (V3.1)
    let hook = HOOKS[i % HOOKS.length];
    let interpretation = "";

    const meaning = drawn.reversed ? drawn.card.meaningReversed : drawn.card.meaningUpright;

    if (!prevDrawn) {
      // Primera carta: El ancla
      hook = "Esto inicia tu viaje de hoy.";
      interpretation = `${meaning} Esta energía es tu punto de partida.`;
    } else {
      // Cartas subsiguientes: La relación
      const prevName = prevDrawn.card.nameEs;
      
      // Lógica de transición
      if (drawn.card.element === prevDrawn.card.element) {
        hook = `La fuerza de ${prevName} se intensifica.`;
        interpretation = `Esa energía de ${drawn.card.element} que sentiste antes se vuelve pura acción ahora. ${meaning}`;
      } else if (drawn.reversed && !prevDrawn.reversed) {
        hook = "Cuidado, aquí hay un giro.";
        interpretation = `Veníamos con fluidez, pero ahora ${drawn.card.nameEs} nos pide frenar. ${meaning}`;
      } else {
        hook = `¿Ves cómo se conecta con ${prevName}?`;
        interpretation = `No puedes avanzar sin integrar lo anterior. ${meaning} El equilibrio está ahí.`;
      }
    }

    reels.push({
      id: `reel-${i}-${Date.now()}`,
      card: drawn,
      title,
      hook,
      interpretation,
      vibe
    });
  }
  
  return reels;
}
