export interface Archetype {
  name: string;
  description: string;
  powers: string[];
  shadow: string;
  coachingNote: string;
}

export const ARCHETYPES: Record<number, Archetype> = {
  1: {
    name: "El Pionero",
    description: "Líder nato con una voluntad inquebrantable. Tu energía es la de quien abre caminos donde nadie ve posibilidad.",
    powers: [
      "Iniciativa irrefrenable",
      "capacidad de actuar antes de tener certeza",
      "autoridad natural bajo presión",
    ],
    shadow: "Individualismo destructivo — necesita tenerlo todo bajo control y no delega hasta que es demasiado tarde.",
    coachingNote: "Confrontar la diferencia entre liderazgo y control. Preguntar: ¿estás liderando o simplemente asegurándote de que nadie te falle?",
  },
  2: {
    name: "El Diplomático",
    description: "Maestro de la cooperación y la intuición sutil. Tu poder reside en la capacidad de ver lo que otros ignoran en las relaciones.",
    powers: [
      "Lectura fina de dinámicas interpersonales",
      "capacidad de construir coaliciones",
      "intuición estratégica para timing",
    ],
    shadow: "Evita el conflicto a costo de su propia posición — cede cuando debería sostener.",
    coachingNote: "Confrontar el patrón de apaciguamiento. Preguntar: ¿estás siendo diplomático o simplemente evitando decir lo que realmente piensas?",
  },
  3: {
    name: "El Comunicador",
    description: "Catalizador creativo que transforma ideas abstractas en realidades tangibles. Tu expresión es tu arma estratégica.",
    powers: [
      "Narración persuasiva",
      "síntesis creativa de conceptos complejos",
      "capacidad de generar momentum social",
    ],
    shadow: "Dispersión — arranca múltiples proyectos con energía pero no termina ninguno.",
    coachingNote: "Confrontar la diferencia entre creatividad productiva y evitar el compromiso. Preguntar: ¿cuántos proyectos \"en proceso\" tienes que en realidad ya abandonaste?",
  },
  4: {
    name: "El Arquitecto de Sistemas",
    description: "Constructor metódico de estructuras duraderas. Tu disciplina y visión a largo plazo son tu ventaja competitiva definitiva.",
    powers: [
      "Construcción de procesos escalables",
      "consistencia bajo presión",
      "capacidad de sostener esfuerzo donde otros abandonan",
    ],
    shadow: "Rigidez — se aferra a sistemas que ya no sirven por miedo al caos del cambio.",
    coachingNote: "Confrontar la diferencia entre disciplina y resistencia al cambio. Preguntar: ¿este sistema que defiendes aún te sirve, o ya es solo lo que conoces?",
  },
  5: {
    name: "El Agente de Cambio",
    description: "Adaptable y magnético. Prosperas en el caos y conviertes la incertidumbre en oportunidad donde otros ven riesgo.",
    powers: [
      "Adaptabilidad extrema",
      "lectura rápida de oportunidades emergentes",
      "capacidad de pivote sin parálisis",
    ],
    shadow: "Inestabilidad crónica — huye del compromiso y la profundidad disfrazándolo de \"libertad\".",
    coachingNote: "Confrontar el patrón de escape. Preguntar: ¿tu próximo movimiento es una oportunidad real o simplemente estás huyendo de lo que requiere más de ti?",
  },
  6: {
    name: "El Estratega del Equilibrio",
    description: "Armonizador nato que entiende que el verdadero poder está en la responsabilidad consciente y el servicio estratégico.",
    powers: [
      "Visión sistémica de relaciones y dependencias",
      "capacidad de sostener roles de liderazgo emocional",
      "confianza que genera en otros",
    ],
    shadow: "Martirio voluntario — carga responsabilidades ajenas hasta el agotamiento para sentirse necesario.",
    coachingNote: "Confrontar la diferencia entre servicio y necesidad de ser indispensable. Preguntar: ¿a quién estás ayudando realmente, o es esta carga una forma de validarte?",
  },
  7: {
    name: "El Analista Profundo",
    description: "Pensador penetrante que opera en un nivel de percepción que otros no pueden alcanzar. Tu introspección es tu superpoder.",
    powers: [
      "Diagnóstico preciso de sistemas complejos",
      "toma de decisiones desde evidencia no ruido",
      "resiliencia ante presión social",
    ],
    shadow: "Parálisis por análisis — usa la investigación como escudo contra la acción.",
    coachingNote: "Confrontar la diferencia entre \"necesito más datos\" y \"tengo miedo de equivocarme\". Preguntar: ¿qué certeza exacta necesitas para moverte?",
  },
  8: {
    name: "El Ejecutor de Poder",
    description: "Manifestador de abundancia y autoridad. Entiendes las leyes del poder material y las usas con precisión quirúrgica.",
    powers: [
      "Orientación a resultados tangibles",
      "capacidad de tomar decisiones de alto impacto bajo presión",
      "magnetismo de recursos",
    ],
    shadow: "Abuso de poder o colapso — opera en extremos: domina o se rinde completamente.",
    coachingNote: "Confrontar la relación con la autoridad y el fracaso. Preguntar: cuando pierdes control de una situación, ¿qué historia te cuentas sobre ti mismo?",
  },
  9: {
    name: "El Visionario Global",
    description: "Conciencia expandida que ve el panorama completo. Tu misión trasciende lo personal y toca lo colectivo.",
    powers: [
      "Pensamiento de largo plazo y alto impacto",
      "capacidad de inspirar movimientos",
      "integración de perspectivas opuestas",
    ],
    shadow: "Evasión de lo concreto — se pierde en la visión y nunca baja a la ejecución.",
    coachingNote: "Confrontar la distancia entre visión y acción. Preguntar: ¿cuál es el primer paso específico esta semana, no el plan de los próximos cinco años?",
  },
  11: {
    name: "El Iluminador Maestro",
    description: "Potencial magnético con una visión altamente intuitiva. Eres un puente entre lo visible y lo invisible.",
    powers: [
      "Intuición estratégica de alto nivel",
      "capacidad de inspirar con autenticidad",
      "percepción de dinámicas que otros no ven",
    ],
    shadow: "Ansiedad por el propósito — la grandeza del potencial paraliza en lugar de movilizar.",
    coachingNote: "Confrontar la brecha entre potencial y acción. Preguntar: ¿qué harías hoy si no sintieras la presión de estar a la altura de quien \"deberías\" ser?",
  },
  22: {
    name: "El Constructor Maestro",
    description: "Capacidad pragmática suprema para convertir visiones en imperios. Tu legado es tangible y transformador.",
    powers: [
      "Arquitectura de proyectos de escala",
      "disciplina sostenida en el tiempo",
      "capacidad de aterrizar lo visionario en lo estructural",
    ],
    shadow: "Perfeccionismo paralizante — el estándar propio es tan alto que nada es suficiente para empezar.",
    coachingNote: "Confrontar la diferencia entre excelencia y perfeccionismo defensivo. Preguntar: ¿qué versión imperfecta de esto podría lanzar hoy?",
  },
  33: {
    name: "El Maestro Sanador",
    description: "Vibración compasiva extrema. Influencia transformadora pura. Naces para elevar la conciencia de otros.",
    powers: [
      "Impacto emocional profundo",
      "capacidad de sostener espacios de transformación",
      "autoridad moral genuina",
    ],
    shadow: "Auto-sacrificio extremo — da hasta el agotamiento total y resiente a quienes no lo reconocen.",
    coachingNote: "Confrontar el límite entre servicio y negación del yo. Preguntar: ¿qué necesitas tú ahora mismo, antes de pensar en lo que necesitan los demás?",
  },
};
