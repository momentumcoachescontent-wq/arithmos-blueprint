import { hashString } from "@/lib/utils";
import { generateSynthesis } from "./synthesizer";

export interface TarotCard {
  id: number;
  name: string;
  nameEs: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  /** Zodiac sign or planet association */
  association: string;
  element: "fuego" | "agua" | "aire" | "tierra" | "espíritu";
  keywords: string[];
  keywordsEs: string[];
  meaningUpright: string;
  meaningReversed: string;
  /** Unicode emoji representing the card's energy */
  emoji: string;
}

export type SpreadType = "daily" | "past-present-future" | "love" | "decision" | "therapeutic";

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
  synthesis?: string;
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
  therapeutic: {
    type: "therapeutic",
    nameEs: "Tarot Terapéutico",
    positions: ["Presente", "Bloqueo", "Raíz", "Consejo", "Entorno", "Potencial"],
    description: "Análisis profundo de 6 cartas para sanar y evolucionar.",
  },
};

/* ============================================
   MAJOR ARCANA (22 cards)
   ============================================ */

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: "The Fool", nameEs: "El Loco",
    arcana: "major", association: "Urano", element: "aire",
    keywords: ["new beginnings", "freedom", "innocence"],
    keywordsEs: ["nuevos comienzos", "libertad", "inocencia"],
    meaningUpright: "Un salto de fe. El universo te invita a empezar algo sin saber el final. Confía.",
    meaningReversed: "Miedo a lo desconocido. Estás reteniendo un salto que tu alma pide dar.",
    emoji: "🃏",
  },
  {
    id: 1, name: "The Magician", nameEs: "El Mago",
    arcana: "major", association: "Mercurio", element: "aire",
    keywords: ["manifestation", "willpower", "skill"],
    keywordsEs: ["manifestación", "voluntad", "habilidad"],
    meaningUpright: "Tienes todas las herramientas. Es momento de crear tu realidad con intención.",
    meaningReversed: "Manipulación o talento desperdiciado. ¿Estás usando tu poder para el bien?",
    emoji: "✨",
  },
  {
    id: 2, name: "The High Priestess", nameEs: "La Sacerdotisa",
    arcana: "major", association: "Luna", element: "agua",
    keywords: ["intuition", "mystery", "inner voice"],
    keywordsEs: ["intuición", "misterio", "voz interior"],
    meaningUpright: "Tu intuición grita. Deja de buscar respuestas afuera; ya las tienes dentro.",
    meaningReversed: "Estás ignorando tu voz interior. El ruido externo ahoga tu sabiduría.",
    emoji: "🌙",
  },
  {
    id: 3, name: "The Empress", nameEs: "La Emperatriz",
    arcana: "major", association: "Venus", element: "tierra",
    keywords: ["abundance", "nurturing", "sensuality"],
    keywordsEs: ["abundancia", "nutrición", "sensualidad"],
    meaningUpright: "Fertilidad en todo sentido. Ideas, proyectos y relaciones florecen con tu energía.",
    meaningReversed: "Descuido de ti misma. No puedes nutrir a otros con el vaso vacío.",
    emoji: "👑",
  },
  {
    id: 4, name: "The Emperor", nameEs: "El Emperador",
    arcana: "major", association: "Aries", element: "fuego",
    keywords: ["authority", "structure", "leadership"],
    keywordsEs: ["autoridad", "estructura", "liderazgo"],
    meaningUpright: "Es hora de poner orden. Tu mundo necesita estructura y límites claros.",
    meaningReversed: "Control excesivo o tiranía. El poder sin empatía destruye lo que construye.",
    emoji: "🏛️",
  },
  {
    id: 5, name: "The Hierophant", nameEs: "El Hierofante",
    arcana: "major", association: "Tauro", element: "tierra",
    keywords: ["tradition", "teaching", "beliefs"],
    keywordsEs: ["tradición", "enseñanza", "creencias"],
    meaningUpright: "Busca un mentor o vuelve a tus raíces. Hay sabiduría en lo tradicional.",
    meaningReversed: "Rebeldía necesaria. Algunas reglas ya no te sirven. Crea las tuyas.",
    emoji: "📿",
  },
  {
    id: 6, name: "The Lovers", nameEs: "Los Amantes",
    arcana: "major", association: "Géminis", element: "aire",
    keywords: ["love", "choice", "alignment"],
    keywordsEs: ["amor", "elección", "alineación"],
    meaningUpright: "Una decisión importante de corazón. Elige lo que te alinea, no lo que te conviene.",
    meaningReversed: "Desalineación en una relación o decisión. ¿Estás siendo honesta contigo?",
    emoji: "💞",
  },
  {
    id: 7, name: "The Chariot", nameEs: "El Carro",
    arcana: "major", association: "Cáncer", element: "agua",
    keywords: ["determination", "victory", "control"],
    keywordsEs: ["determinación", "victoria", "control"],
    meaningUpright: "Avanza con todo. La victoria es tuya si mantienes el rumbo con voluntad.",
    meaningReversed: "Fuerzas internas en guerra. Antes de avanzar, alinea tus contradicciones.",
    emoji: "🏆",
  },
  {
    id: 8, name: "Strength", nameEs: "La Fuerza",
    arcana: "major", association: "Leo", element: "fuego",
    keywords: ["courage", "patience", "inner strength"],
    keywordsEs: ["coraje", "paciencia", "fuerza interior"],
    meaningUpright: "Tu poder no está en la agresión sino en la serenidad. Doma tu bestia interior con amor.",
    meaningReversed: "Inseguridad o fuerza bruta. Estás buscando poder donde no lo hay.",
    emoji: "🦁",
  },
  {
    id: 9, name: "The Hermit", nameEs: "El Ermitaño",
    arcana: "major", association: "Virgo", element: "tierra",
    keywords: ["solitude", "wisdom", "introspection"],
    keywordsEs: ["soledad", "sabiduría", "introspección"],
    meaningUpright: "Retírate del ruido. Este es un momento sagrado de búsqueda interior.",
    meaningReversed: "Aislamiento excesivo o miedo a estar sola contigo misma.",
    emoji: "🏔️",
  },
  {
    id: 10, name: "Wheel of Fortune", nameEs: "La Rueda de la Fortuna",
    arcana: "major", association: "Júpiter", element: "fuego",
    keywords: ["cycles", "fate", "turning point"],
    keywordsEs: ["ciclos", "destino", "punto de inflexión"],
    meaningUpright: "El universo gira a tu favor. Un cambio de ciclo poderoso está en marcha.",
    meaningReversed: "Resistencia al cambio. La rueda gira aunque no quieras. Fluye.",
    emoji: "🎡",
  },
  {
    id: 11, name: "Justice", nameEs: "La Justicia",
    arcana: "major", association: "Libra", element: "aire",
    keywords: ["truth", "fairness", "karma"],
    keywordsEs: ["verdad", "equidad", "karma"],
    meaningUpright: "La verdad sale a la luz. Toma decisiones justas, el karma está activo.",
    meaningReversed: "Injusticia o deshonestidad. ¿Hay algo que no estás viendo con claridad?",
    emoji: "⚖️",
  },
  {
    id: 12, name: "The Hanged Man", nameEs: "El Colgado",
    arcana: "major", association: "Neptuno", element: "agua",
    keywords: ["surrender", "new perspective", "pause"],
    keywordsEs: ["rendición", "nueva perspectiva", "pausa"],
    meaningUpright: "Suelta el control. La respuesta aparece cuando dejas de forzar.",
    meaningReversed: "Resistencia al soltar. Estás atrapada en un patrón que ya no sirve.",
    emoji: "🔄",
  },
  {
    id: 13, name: "Death", nameEs: "La Muerte",
    arcana: "major", association: "Escorpio", element: "agua",
    keywords: ["transformation", "endings", "rebirth"],
    keywordsEs: ["transformación", "finales", "renacimiento"],
    meaningUpright: "Algo muere para que algo nuevo nazca. No temas el fin; es tu metamorfosis.",
    meaningReversed: "Negas un final necesario. Lo que no dejas ir te arrastra.",
    emoji: "🦋",
  },
  {
    id: 14, name: "Temperance", nameEs: "La Templanza",
    arcana: "major", association: "Sagitario", element: "fuego",
    keywords: ["balance", "harmony", "patience"],
    keywordsEs: ["equilibrio", "armonía", "paciencia"],
    meaningUpright: "Encuentra el punto medio. La magia está en la mezcla perfecta de tus opuestos.",
    meaningReversed: "Exceso o desequilibrio. Algo está fuera de proporción en tu vida.",
    emoji: "⚗️",
  },
  {
    id: 15, name: "The Devil", nameEs: "El Diablo",
    arcana: "major", association: "Capricornio", element: "tierra",
    keywords: ["shadow", "attachment", "illusion"],
    keywordsEs: ["sombra", "apego", "ilusión"],
    meaningUpright: "Mira tu sombra de frente. Esas cadenas que sientes… tú tienes la llave.",
    meaningReversed: "Liberación de un vicio o relación tóxica. Estás rompiendo tus cadenas.",
    emoji: "⛓️",
  },
  {
    id: 16, name: "The Tower", nameEs: "La Torre",
    arcana: "major", association: "Marte", element: "fuego",
    keywords: ["upheaval", "revelation", "liberation"],
    keywordsEs: ["derrumbe", "revelación", "liberación"],
    meaningUpright: "Lo que se cae necesitaba caer. La destrucción es la primera fase de tu reconstrucción.",
    meaningReversed: "La destrucción ya pasó. Es momento de recoger las piezas y reconstruir mejor.",
    emoji: "⚡",
  },
  {
    id: 17, name: "The Star", nameEs: "La Estrella",
    arcana: "major", association: "Acuario", element: "aire",
    keywords: ["hope", "inspiration", "healing"],
    keywordsEs: ["esperanza", "inspiración", "sanación"],
    meaningUpright: "Después de la tormenta viene la estrella. Estás sanando y el universo lo celebra.",
    meaningReversed: "Pérdida de fe. Recuerda: siempre hay luz después de la oscuridad más profunda.",
    emoji: "⭐",
  },
  {
    id: 18, name: "The Moon", nameEs: "La Luna",
    arcana: "major", association: "Piscis", element: "agua",
    keywords: ["illusion", "subconscious", "dreams"],
    keywordsEs: ["ilusión", "subconsciente", "sueños"],
    meaningUpright: "No todo es lo que parece. Tu subconsciente tiene mensajes que necesitas escuchar.",
    meaningReversed: "Claridad emerge de la confusión. Los miedos pierden poder cuando los nombras.",
    emoji: "🌕",
  },
  {
    id: 19, name: "The Sun", nameEs: "El Sol",
    arcana: "major", association: "Sol", element: "fuego",
    keywords: ["joy", "vitality", "success"],
    keywordsEs: ["alegría", "vitalidad", "éxito"],
    meaningUpright: "¡Brilla! Todo se alinea. Éxito, alegría y vitalidad están de tu lado.",
    meaningReversed: "Alegría bloqueada. ¿Qué te impide disfrutar lo que ya lograste?",
    emoji: "☀️",
  },
  {
    id: 20, name: "Judgement", nameEs: "El Juicio",
    arcana: "major", association: "Plutón", element: "fuego",
    keywords: ["rebirth", "calling", "absolution"],
    keywordsEs: ["renacimiento", "llamado", "absolución"],
    meaningUpright: "Un llamado superior. Es hora de responder a tu propósito real.",
    meaningReversed: "Autoduda o ignoras tu llamado. El juicio más duro es el que te haces tú.",
    emoji: "📯",
  },
  {
    id: 21, name: "The World", nameEs: "El Mundo",
    arcana: "major", association: "Saturno", element: "tierra",
    keywords: ["completion", "achievement", "wholeness"],
    keywordsEs: ["completitud", "logro", "plenitud"],
    meaningUpright: "Ciclo completo. Has llegado. Celebra antes de empezar el siguiente nivel.",
    meaningReversed: "Casi llegas pero algo falta. Revisa qué hilo suelto no has cerrado.",
    emoji: "🌍",
  },
];

const COURT_NAMES = {
  11: { en: "Page", es: "Sota" },
  12: { en: "Knight", es: "Caballero" },
  13: { en: "Queen", es: "Reina" },
  14: { en: "King", es: "Rey" },
};

/* ============================================
   MINOR ARCANA GENERATOR
   (56 cards across 4 suits)
   ============================================ */

const SUIT_META = {
  wands: { element: "fuego" as const, emoji: "🔥", nameEs: "Bastos", keywords: ["pasión", "acción", "creatividad"] },
  cups: { element: "agua" as const, emoji: "💧", nameEs: "Copas", keywords: ["emoción", "amor", "intuición"] },
  swords: { element: "aire" as const, emoji: "⚔️", nameEs: "Espadas", keywords: ["pensamiento", "conflicto", "verdad"] },
  pentacles: { element: "tierra" as const, emoji: "💰", nameEs: "Oros", keywords: ["material", "trabajo", "salud"] },
};

const MINOR_ARCANA_MEANINGS: Record<string, { upright: string; reversed: string }> = {
  "wands-1": { upright: "Una chispa de inspiración pura. Es momento de actuar sobre esa idea que te quema.", reversed: "Falta de dirección. Tienes el fuego pero no el foco." },
  "wands-2": { upright: "Planificación y visión. El mundo es tuyo, pero necesitas una estrategia clara.", reversed: "Inseguridad sobre el futuro. No temas al horizonte." },
  "wands-3": { upright: "Expansión. Tus esfuerzos empiezan a dar frutos. Mira más allá de lo inmediato.", reversed: "Retrasos en tus planes. La impaciencia es tu peor enemiga hoy." },
  "wands-4": { upright: "Celebración y estabilidad. Has construido algo sólido. Disfruta el momento.", reversed: "Tensión en el hogar o equipo. La armonía requiere mantenimiento." },
  "wands-5": { upright: "Competencia y conflicto menor. El caos creativo te obliga a definir tu postura.", reversed: "Evitación del conflicto necesario. No te escondas de la fricción." },
  "wands-6": { upright: "Victoria y reconocimiento público. Tu esfuerzo es validado por los demás.", reversed: "Caída del pedestal. El ego te está jugando una mala pasada." },
  "wands-7": { upright: "Defensa y perseverancia. Mantente firme en tu posición; tienes la ventaja.", reversed: "Abrumada por las demandas. Estás soltando tus límites." },
  "wands-8": { upright: "Movimiento rápido. Las noticias llegan y todo se acelera. Fluye con la velocidad.", reversed: "Velocidad sin control. Estás siendo impulsiva y podrías chocar." },
  "wands-9": { upright: "Resiliencia. Estás cansada pero la meta está cerca. No bajes la guardia.", reversed: "Agotamiento total. Estás defendiendo una muralla que ya no necesitas." },
  "wands-10": { upright: "Carga pesada. El éxito ha traído demasiadas responsabilidades. Delega.", reversed: "Colapso bajo presión. Suelta las piedras que no te corresponden cargar." },
  "wands-11": { upright: "Noticias emocionantes. Un mensaje que activa tu curiosidad y deseo de aventura.", reversed: "Chismes o noticias que distraen. Energía dispersa en tonterías." },
  "wands-12": { upright: "Acción impulsiva y valiente. Alguien o algo entra en tu vida con intensidad total.", reversed: "Fuerza destructiva. La prisa te está haciendo perder la elegancia." },
  "wands-13": { upright: "Confianza y magnetismo. Irradias poder y atraes lo que deseas con carisma.", reversed: "Inseguridad disfrazada de arrogancia. Celos o competencia tóxica." },
  "wands-14": { upright: "Liderazgo visionario. Tienes el plano completo y la energía para ejecutarlo.", reversed: "Visión nublada por el ego. Estás imponiendo tu voluntad sin sabiduría." },

  "cups-1": { upright: "Un nuevo comienzo emocional. El corazón se abre a una frecuencia de amor puro.", reversed: "Bloqueo emocional. Estás reprimiendo lo que sientes por miedo al desborde." },
  "cups-2": { upright: "Conexión y alma espejo. Una relación se profundiza en equilibrio y respeto.", reversed: "Desconexión o falta de armonía. El espejo está empañado." },
  "cups-3": { upright: "Celebración en comunidad. La alegría de compartir con quienes te nutren el alma.", reversed: "Exceso de ruido social. Estás buscando afuera lo que solo tú puedes darte." },
  "cups-4": { upright: "Apatía o meditación. El universo te ofrece una copa pero tú no quieres verla.", reversed: "Despertar del letargo. Finalmente ves la oportunidad que ignorabas." },
  "cups-5": { upright: "Duelo y pérdida. Lloras las copas derramadas sin ver las que aún quedan en pie.", reversed: "Aceptación y retorno. El dolor empieza a transmutarse en aprendizaje." },
  "cups-6": { upright: "Nostalgia sanadora. Conectar con tu niña interior para recuperar la inocencia.", reversed: "Vivir en el pasado. Te aferras a un recuerdo que ya no tiene vida." },
  "cups-7": { upright: "Ilusiones y opciones. Demasiadas fantasías te impiden tomar una decisión real.", reversed: "Claridad mental. Las proyecciones se disuelven y ves la realidad." },
  "cups-8": { upright: "Dejar ir. Abandonas algo que fue importante pero que ya no te nutre.", reversed: "Miedo a caminar sola. Te quedas en una situación vacía por comodidad." },
  "cups-9": { upright: "Gratitud y satisfacción. El placer de ver tus deseos manifestados en lo cotidiano.", reversed: "Satisfacción superficial. Tienes lo que querías, pero te sientes vacía." },
  "cups-10": { upright: "Plenitud emocional. La sensación de pertenencia y paz en tus vínculos más íntimos.", reversed: "Falsa armonía familiar. Los secretos bajo la alfombra están pesando." },
  "cups-11": { upright: "Mensaje de amor o intuición. Una sorpresa emocional que te saca una sonrisa.", reversed: "Inmadurez emocional. Te dejas llevar por impulsos sentimentales sin base." },
  "cups-12": { upright: "Propuesta romántica o artística. Alguien vulnerable y poético entra en tu espacio.", reversed: "Manipulación emocional o adicciones. Alguien que drena tu energía." },
  "cups-13": { upright: "Sabiduría intuitiva. Eres el faro emocional para otros; confía en tu percepción.", reversed: "Mártir o desborde. Estás ahogándote en los problemas de los demás." },
  "cups-14": { upright: "Control emocional sagrado. Mantienes la calma incluso en la tormenta más profunda.", reversed: "Frialdad o represión. Usas la lógica para evitar sentir el dolor." },

  "swords-1": { upright: "Claridad cortante. Una epifanía que corta la confusión de raíz. Di tu verdad.", reversed: "Confusión mental extrema. La espada es pesada y no sabes hacia dónde apunta." },
  "swords-2": { upright: "Indecisión o tregua. Estás evitando ver la realidad para no tener que elegir.", reversed: "La venda se cae. Ya no puedes postergar el conflicto; decide." },
  "swords-3": { upright: "Dolor necesario. La verdad duele pero te libera de una mentira prolongada.", reversed: "Sanando heridas antiguas. El proceso de duelo está avanzando hacia la paz." },
  "swords-4": { upright: "Descanso y retiro. Tu mente necesita silencio. No tomes decisiones hoy.", reversed: "Inquietud mental. Quieres actuar pero tu sistema nervioso pide pausa." },
  "swords-5": { upright: "Victoria pírrica. Ganaste la discusión pero perdiste la paz o la relación.", reversed: "Reconciliación o arrepentimiento. Dejas de pelear batallas que no importan." },
  "swords-6": { upright: "Transición hacia aguas calmadas. Te alejas de un conflicto hacia algo mejor.", reversed: "Equipaje pesado. Intentas huir pero te llevas el mismo drama contigo." },
  "swords-7": { upright: "Estrategia o engaño. Estás buscando un camino lateral. Revisa tu integridad.", reversed: "Confesión o descubrimiento. Las mentiras propias o ajenas salen a la luz." },
  "swords-8": { upright: "Prisión mental. Te sientes atrapada, pero las vendas y cuerdas están flojas.", reversed: "Liberación. Finalmente entiendes que tú tenías la llave de tu celda." },
  "swords-9": { upright: "Ansiedad y pesadillas. Te preocupas por fantasmas que no han ocurrido.", reversed: "Perspectiva real. Entiendes que tus sombras eran más grandes que el problema." },
  "swords-10": { upright: "Fin de un ciclo doloroso. Tocaste fondo; no hay nada más que perder.", reversed: "Resurrección. Te levantas después del colapso con una nueva piel." },
  "swords-11": { upright: "Curiosidad intelectual. Una mente rápida y afilada que busca la verdad.", reversed: "Sarcasmo o cinismo. Usas tu inteligencia como un arma para herir." },
  "swords-12": { upright: "Verdad impulsiva. Comunicas algo sin filtro y generas un cambio radical.", reversed: "Agresión verbal o paranoia. Ves enemigos donde hay solo espejos." },
  "swords-13": { upright: "Objetividad y límites. Tienes la claridad para cortar lo que no te sirve.", reversed: "Crueldad mental. Estás siendo demasiado dura contigo o con el mundo." },
  "swords-14": { upright: "Autoridad intelectual. Decisiones basadas en la lógica pura y la justicia.", reversed: "Tiranía mental. Manipulas la información para mantener el control." },

  "pentacles-1": { upright: "Oportunidad material. Una semilla de prosperidad lista para ser plantada.", reversed: "Oportunidad desperdiciada por falta de compromiso o miedo a invertir." },
  "pentacles-2": { upright: "Equilibrio y adaptabilidad. Manejas varias prioridades con gracia y ritmo.", reversed: "Caos financiero o desorden. Estás tratando de hacer demasiado." },
  "pentacles-3": { upright: "Colaboración y maestría. Tu trabajo de calidad atrae a las personas correctas.", reversed: "Falta de trabajo en equipo. El perfeccionismo te aísla del progreso." },
  "pentacles-4": { upright: "Aferramiento y seguridad. Proteges lo que tienes pero te cierras al flujo.", reversed: "Soltar la escasez. Te das cuenta de que el control no es seguridad." },
  "pentacles-5": { upright: "Mentalidad de escasez o pérdida. Te sientes fuera del templo, en el frío.", reversed: "Recuperación. Encuentras apoyo donde menos lo esperabas; la luz vuelve." },
  "pentacles-6": { upright: "Generosidad y flujo. Das y recibes en equilibrio. El universo te compensa.", reversed: "Deudas morales o financieras. Cuidado con los favores que tienen precio." },
  "pentacles-7": { upright: "Paciencia y evaluación. Sembraste, ahora espera a que el fruto madure.", reversed: "Frustración por la lentitud. Quieres cosechar antes de tiempo." },
  "pentacles-8": { upright: "Dedicación y detalle. Estás puliendo tu talento con disciplina diaria.", reversed: "Aburrimiento o falta de propósito en lo que haces. Trabajo mecánico." },
  "pentacles-9": { upright: "Independencia y lujo. Disfrutas de tu propia compañía y de tu éxito sólido.", reversed: "Dependencia financiera o falta de valor propio. Riqueza vacía." },
  "pentacles-10": { upright: "Legado y abundancia a largo plazo. Algo que trasciende tu momento actual.", reversed: "Conflictos de herencia o valores familiares que te limitan." },
  "pentacles-11": { upright: "Prudencia y aprendizaje práctico. Un nuevo camino laboral con buen futuro.", reversed: "Pereza o falta de realismo. Sueñas con oro sin querer ensuciarte las manos." },
  "pentacles-12": { upright: "Disciplina y constancia. El éxito viene a través del esfuerzo sostenido.", reversed: "Inercia o terquedad. Te aferras a un método que ya es obsoleto." },
  "pentacles-13": { upright: "Abundancia nutricia. Eres capaz de crear belleza y confort en tu entorno.", reversed: "Obsesión material o desorden en el hogar. El cuerpo pide atención." },
  "pentacles-14": { upright: "Maestría sobre la materia. Controlas tus recursos con visión de futuro.", reversed: "Corupción o avaricia. El dinero te domina en lugar de tú a él." },
};

function generateMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  let id = 22;

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

      const key = `${suit}-${num}`;
      const meaning = MINOR_ARCANA_MEANINGS[key] || { 
        upright: `Energía de ${meta.nameEs} en nivel ${num}.`, 
        reversed: `Bloqueo de ${meta.nameEs} en nivel ${num}.` 
      };

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
        keywordsEs: meta.keywords,
        meaningUpright: meaning.upright,
        meaningReversed: meaning.reversed,
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

  const reading: TarotReading = {
    spread: spreadType,
    cards: drawn.map((d, i) => ({
      ...d,
      position: spread.positions[i],
    })),
    timestamp: new Date().toISOString(),
  };

  reading.synthesis = generateSynthesis(reading);
  return reading;
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
