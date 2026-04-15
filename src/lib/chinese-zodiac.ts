/**
 * Arithmos V3.1 — Chinese Zodiac Engine
 * 
 * Deterministic calculation of the Chinese Zodiac sign based on birth year.
 */

export interface ChineseZodiacSign {
  animal: string;
  element: string;
  description: string;
  vibe: string;
  dailyGuide: string;
}

const ZODIAC_SIGNS: Record<number, { animal: string; description: string; vibe: string; dailyGuide: string }> = {
  0: { 
    animal: "Rata", 
    description: "Ingeniosa, versátil y amable. Sabes encontrar oportunidades donde otros no ven nada.", 
    vibe: "Ingenio",
    dailyGuide: "Usa tu agudeza mental para resolver ese reto que otros consideran imposible."
  },
  1: { 
    animal: "Buey", 
    description: "Decidido, honesto y ambicioso. Tu fuerza reside en la perseverancia y la fiabilidad.", 
    vibe: "Persistencia",
    dailyGuide: "Tu constancia hoy será la semilla de un éxito sólido mañana. No te detengas."
  },
  2: { 
    animal: "Tigre", 
    description: "Valiente, competitivo y seguro de sí mismo. Eres un líder nato que inspira acción.", 
    vibe: "Coraje",
    dailyGuide: "Confía en tu instinto de líder; hoy tu valentía abrirá puertas que estaban cerradas."
  },
  3: { 
    animal: "Conejo", 
    description: "Gentil, elegante y alerta. Tu sensibilidad es tu brújula para navegar el caos.", 
    vibe: "Elegancia",
    dailyGuide: "Busca la paz en los detalles pequeños. Tu intuición te guiará hacia la armonía."
  },
  4: { 
    animal: "Dragón", 
    description: "Seguro, inteligente y entusiasta. Posees un magnetismo natural y un poder visionario.", 
    vibe: "Poder",
    dailyGuide: "Tu fuego interno está al máximo. Proyecta tu visión y el mundo te seguirá."
  },
  5: { 
    animal: "Serpiente", 
    description: "Inteligente, sabia y decidida. Tu intuición te permite ver lo que está oculto.", 
    vibe: "Sabiduría",
    dailyGuide: "Observa en silencio. La respuesta que buscas está en lo que nadie más ve."
  },
  6: { 
    animal: "Caballo", 
    description: "Animado, activo y enérgico. Amas la libertad y tienes una vitalidad inagotable.", 
    vibe: "Libertad",
    dailyGuide: "Galopa hacia lo nuevo. La libertad de hoy traerá la claridad de mañana."
  },
  7: { 
    animal: "Cabra", 
    description: "Suave, modesta y simpática. Tu creatividad nace de una profunda paz interior.", 
    vibe: "Creatividad",
    dailyGuide: "Deja que tu sensibilidad hable. Un acto creativo hoy sanará tu entorno."
  },
  8: { 
    animal: "Mono", 
    description: "Agudo, inteligente y curioso. Tienes una habilidad única para resolver problemas complejos.", 
    vibe: "Agudeza",
    dailyGuide: "Diviértete con los desafíos. Tu ingenio encontrará el camino más corto hoy."
  },
  9: { 
    animal: "Gallo", 
    description: "Observador, trabajador y valiente. Tu disciplina inspira orden en tu entorno.", 
    vibe: "Orden",
    dailyGuide: "Tu atención al detalle es tu escudo. Mantén el orden y el éxito vendrá solo."
  },
  10: { 
    animal: "Perro", 
    description: "Leal, honesto y prudente. Tu sentido de la justicia es el pilar de tu autoridad.", 
    vibe: "Lealtad",
    dailyGuide: "Tu lealtad es tu mayor tesoro hoy. Mantente fiel a tus valores y vencerás."
  },
  11: { 
    animal: "Cerdo", 
    description: "Compasivo, generoso y diligente. Encuentras la abundancia en la paz y el servicio.", 
    vibe: "Abundancia",
    dailyGuide: "La generosidad atrae abundancia. Comparte tu luz y verás el flujo cósmico."
  },
};

export function getChineseZodiac(birthDate: string | Date): ChineseZodiacSign {
  const date = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const year = date.getFullYear();
  
  // El ciclo chino se basa en el año (aproximadamente, empezando en el Nuevo Año Chino)
  // Nota: Para precisión absoluta se debería considerar el mes/día del año lunar, 
  // pero para el propósito de Arithmos el año solar es el estándar común.
  const signIndex = (year - 4) % 12;
  const sign = ZODIAC_SIGNS[signIndex < 0 ? signIndex + 12 : signIndex];
  
  // Determinamos el elemento basado en el último dígito del año
  const elements = ["Metal", "Metal", "Agua", "Agua", "Madera", "Madera", "Fuego", "Fuego", "Tierra", "Tierra"];
  const element = elements[year % 10];
  
  return {
    ...sign,
    element,
  };
}
