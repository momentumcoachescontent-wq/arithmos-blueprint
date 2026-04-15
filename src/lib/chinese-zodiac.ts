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
}

const ZODIAC_SIGNS: Record<number, { animal: string; description: string; vibe: string }> = {
  0: { animal: "Rata", description: "Ingeniosa, versátil y amable. Sabes encontrar oportunidades donde otros no ven nada.", vibe: "Ingenio" },
  1: { animal: "Buey", description: "Decidido, honesto y ambicioso. Tu fuerza reside en la perseverancia y la fiabilidad.", vibe: "Persistencia" },
  2: { animal: "Tigre", description: "Valiente, competitivo y seguro de sí mismo. Eres un líder nato que inspira acción.", vibe: "Coraje" },
  3: { animal: "Conejo", description: "Gentil, elegante y alerta. Tu sensibilidad es tu brújula para navegar el caos.", vibe: "Elegancia" },
  4: { animal: "Dragón", description: "Seguro, inteligente y entusiasta. Posees un magnetismo natural y un poder visionario.", vibe: "Poder" },
  5: { animal: "Serpiente", description: "Inteligente, sabia y decidida. Tu intuición te permite ver lo que está oculto.", vibe: "Sabiduría" },
  6: { animal: "Caballo", description: "Animado, activo y enérgico. Amas la libertad y tienes una vitalidad inagotable.", vibe: "Libertad" },
  7: { animal: "Cabra", description: "Suave, modesta y simpática. Tu creatividad nace de una profunda paz interior.", vibe: "Creatividad" },
  8: { animal: "Mono", description: "Agudo, inteligente y curioso. Tienes una habilidad única para resolver problemas complejos.", vibe: "Agudeza" },
  9: { animal: "Gallo", description: "Observador, trabajador y valiente. Tu disciplina inspira orden en tu entorno.", vibe: "Orden" },
  10: { animal: "Perro", description: "Leal, honesto y prudente. Tu sentido de la justicia es el pilar de tu autoridad.", vibe: "Lealtad" },
  11: { animal: "Cerdo", description: "Compasivo, generoso y diligente. Encuentras la abundancia en la paz y el servicio.", vibe: "Abundancia" },
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
