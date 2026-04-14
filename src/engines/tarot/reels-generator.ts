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
  
  return cards.map((drawn, i) => {
    const isMajor = drawn.card.arcana === "major";
    
    // Determinamos el vibe basado en el arcano o el palo
    let vibe: TarotReel["vibe"] = "manifest";
    if (drawn.card.suit === "swords") vibe = "warning";
    if (drawn.card.suit === "cups" || drawn.card.id === 6) vibe = "love";
    if (drawn.card.suit === "wands" || drawn.card.id === 1) vibe = "power";

    // Generamos un título dinámico
    const title = `${drawn.card.nameEs}${drawn.reversed ? " (Invertida)" : ""}`;
    const hook = HOOKS[i % HOOKS.length];
    
    // Interpretación punchy
    let interpretation = "";
    if (drawn.reversed) {
      interpretation = `Algo está bloqueado. ${drawn.card.meaningReversed} Deja de forzar y empieza a soltar.`;
    } else {
      interpretation = `${drawn.card.meaningUpright} Es el momento. Hazlo con miedo, pero hazlo.`;
    }

    return {
      id: `reel-${i}-${Date.now()}`,
      card: drawn,
      title,
      hook,
      interpretation,
      vibe
    };
  });
}
