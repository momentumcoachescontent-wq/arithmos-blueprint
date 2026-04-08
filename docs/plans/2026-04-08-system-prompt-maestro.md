# System Prompt Maestro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `chat-coach` from OpenAI GPT-4o to Claude Sonnet 4.6 with the Brave Path Coach system prompt + active archetype injection, and replace the n8n `arithmos-calculate` webhook with a deterministic Supabase Edge Function.

**Architecture:** Three new Deno shared modules (`archetypes.ts`, `numerology.ts`, `prompts.ts`) feed a new `calculate-blueprint` Edge Function and a migrated `chat-coach`. The frontend calls `calculate-blueprint` during registration and passes rich archetype context to `chat-coach` via `useCoachSession.ts`.

**Tech Stack:** Deno (Supabase Edge Functions), `npm:@anthropic-ai/sdk`, TypeScript, React, Vitest, Deno test (`jsr:@std/assert`)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `supabase/functions/_shared/archetypes.ts` | 12-archetype knowledge base with powers, shadow, coachingNote |
| Create | `supabase/functions/_shared/numerology.ts` | Deterministic Pythagorean numerology math |
| Create | `supabase/functions/_shared/prompts.ts` | Brave Path Coach prompt builder |
| Create | `supabase/functions/calculate-blueprint/index.ts` | HTTP handler: name + birthDate → full numerology profile |
| Modify | `supabase/functions/deno.json` | Add `@anthropic-ai/sdk` to import map |
| Modify | `supabase/functions/chat-coach/index.ts` | Replace OpenAI with Anthropic, inject archetype context |
| Modify | `supabase/functions/_shared/token-tracker.ts` | Add Claude model rates |
| Create | `src/lib/archetypes.ts` | Frontend archetype context map (powers, shadow, coachingNote) |
| Modify | `src/hooks/useCoachSession.ts` | Expand context object sent to chat-coach |
| Modify | `src/hooks/useProfile.ts` | Replace n8n retry logic in createProfile with calculate-blueprint call |

> **Note on useProfile.ts:** The calculation functions (`calculateLifePath`, `reduceToSingleDigitOrMaster`, etc.) are **kept** in `useProfile.ts` — they are imported by `CycleChart.tsx`, `TacticalRecommendations.tsx`, `DailyPulseCard.tsx`, `useMissions.ts`, `FrictionRadar.tsx`, and `TribunalPoder.tsx`. Only `createProfile` is changed: local fallback removed, n8n replaced with `calculate-blueprint`.

> **Note on useCoachSession.ts:** The spec lists `useProfile.ts` for context expansion, but the chat context object is actually built in `useCoachSession.ts:143-147`. Task 7 is where this fix lives.

---

### Task 1: Archetype Knowledge Base

**Files:**
- Create: `supabase/functions/_shared/archetypes.ts`
- Create: `supabase/functions/_shared/archetypes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `supabase/functions/_shared/archetypes.test.ts`:

```typescript
import { assertEquals, assertExists } from "jsr:@std/assert";
import { ARCHETYPES } from "./archetypes.ts";

Deno.test("ARCHETYPES has exactly 12 entries", () => {
  assertEquals(Object.keys(ARCHETYPES).length, 12);
});

Deno.test("every archetype has all required fields", () => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
  for (const key of keys) {
    const a = ARCHETYPES[key];
    assertExists(a, `archetype ${key} missing`);
    assertExists(a.name, `archetype ${key}.name missing`);
    assertExists(a.description, `archetype ${key}.description missing`);
    assertEquals(Array.isArray(a.powers), true, `archetype ${key}.powers not array`);
    assertEquals(a.powers.length >= 1, true, `archetype ${key}.powers empty`);
    assertExists(a.shadow, `archetype ${key}.shadow missing`);
    assertExists(a.coachingNote, `archetype ${key}.coachingNote missing`);
  }
});

Deno.test("archetype 7 is El Analista Profundo", () => {
  assertEquals(ARCHETYPES[7].name, "El Analista Profundo");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd supabase/functions
deno test _shared/archetypes.test.ts
```

Expected: Error — module `./archetypes.ts` not found.

- [ ] **Step 3: Create `_shared/archetypes.ts`**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd supabase/functions
deno test _shared/archetypes.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/archetypes.ts supabase/functions/_shared/archetypes.test.ts
git commit -m "feat(maestro): add archetype knowledge base with powers, shadow, coachingNote"
```

---

### Task 2: Numerology Calculation Module

**Files:**
- Create: `supabase/functions/_shared/numerology.ts`
- Create: `supabase/functions/_shared/numerology.test.ts`

**Context:** This is a server-side Deno copy of the math that currently lives in `src/hooks/useProfile.ts`. The frontend copy stays there (used by many components). `numerology.ts` is the canonical version for Edge Functions.

- [ ] **Step 1: Write the failing test**

Create `supabase/functions/_shared/numerology.test.ts`:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { reduceToSingleDigitOrMaster, calculateNameValue, calculateLifePath } from "./numerology.ts";

Deno.test("reduceToSingleDigitOrMaster: 24 → 6", () => {
  assertEquals(reduceToSingleDigitOrMaster(24), 6);
});

Deno.test("reduceToSingleDigitOrMaster: 38 → 11 (master)", () => {
  // 38 → 3+8=11, and 11 is a master number
  assertEquals(reduceToSingleDigitOrMaster(38), 11);
});

Deno.test("reduceToSingleDigitOrMaster: 11 stays 11", () => {
  assertEquals(reduceToSingleDigitOrMaster(11), 11);
});

Deno.test("reduceToSingleDigitOrMaster: 22 stays 22", () => {
  assertEquals(reduceToSingleDigitOrMaster(22), 22);
});

Deno.test("calculateNameValue all: 'Ana' → 7 (raw sum before reduction)", () => {
  // a=1, n=5, a=1 → sum=7
  assertEquals(calculateNameValue("Ana", "all"), 7);
});

Deno.test("calculateNameValue vowels: 'Maria' → 11 (raw sum)", () => {
  // vowels: a=1, i=9, a=1 → sum=11 (coincidentally a master number)
  assertEquals(calculateNameValue("Maria", "vowels"), 11);
});

Deno.test("calculateNameValue consonants: 'Maria' → 13 (raw sum before reduction)", () => {
  // consonants: m=4, r=9 → sum=13
  assertEquals(calculateNameValue("Maria", "consonants"), 13);
});

Deno.test("calculateLifePath: '1990-01-15' → 8", () => {
  // year 1990 → 1+9+9+0=19 → 1+9=10 → 1
  // month 01 → 1
  // day 15 → 1+5=6
  // 1+1+6=8
  assertEquals(calculateLifePath("1990-01-15"), 8);
});

Deno.test("calculateLifePath: '1985-11-22' → 11 (master)", () => {
  // year 1985 → 1+9+8+5=23 → 2+3=5
  // month 11 → master, stays 11
  // day 22 → master, stays 22
  // 5+11+22=38 → 3+8=11 (master)
  assertEquals(calculateLifePath("1985-11-22"), 11);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd supabase/functions
deno test _shared/numerology.test.ts
```

Expected: Error — module `./numerology.ts` not found.

- [ ] **Step 3: Create `_shared/numerology.ts`**

```typescript
const PYTHAGOREAN_TABLE: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = ["a", "e", "i", "o", "u"];

function sumDigits(num: number): number {
  return num.toString().split("").reduce((acc, curr) => acc + parseInt(curr), 0);
}

export function reduceToSingleDigitOrMaster(num: number): number {
  const masters = [11, 22, 33];
  let current = num;
  while (current > 9 && !masters.includes(current)) {
    current = sumDigits(current);
  }
  return current;
}

export function calculateNameValue(
  nameStr: string,
  type: "all" | "vowels" | "consonants" = "all",
): number {
  let sum = 0;
  const chars = nameStr.toLowerCase().replace(/[^a-z]/g, "").split("");
  for (const char of chars) {
    const isVowel = VOWELS.includes(char);
    if (
      type === "all" ||
      (type === "vowels" && isVowel) ||
      (type === "consonants" && !isVowel)
    ) {
      sum += PYTHAGOREAN_TABLE[char] || 0;
    }
  }
  return sum;
}

export function calculateLifePath(dateStr: string): number {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return 0;
  const yearReduced = reduceToSingleDigitOrMaster(parseInt(parts[0]));
  const monthReduced = reduceToSingleDigitOrMaster(parseInt(parts[1]));
  const dayReduced = reduceToSingleDigitOrMaster(parseInt(parts[2]));
  return reduceToSingleDigitOrMaster(yearReduced + monthReduced + dayReduced);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd supabase/functions
deno test _shared/numerology.test.ts
```

Expected: 9 tests passing.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/numerology.ts supabase/functions/_shared/numerology.test.ts
git commit -m "feat(maestro): add numerology calculation module for Edge Functions"
```

---

### Task 3: Brave Path Coach Prompt Builder

**Files:**
- Create: `supabase/functions/_shared/prompts.ts`
- Create: `supabase/functions/_shared/prompts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `supabase/functions/_shared/prompts.test.ts`:

```typescript
import { assertStringIncludes } from "jsr:@std/assert";
import { buildCoachSystemPrompt, buildSummarizePrompt } from "./prompts.ts";

const testContext = {
  name: "Laura",
  lifePathNumber: 7,
  archetype: "El Analista Profundo",
  archetypePowers: ["Diagnóstico preciso", "toma de decisiones desde evidencia", "resiliencia"],
  archetypeShadow: "Parálisis por análisis",
  archetypeCoachingNote: "Confrontar la diferencia entre necesito más datos y tengo miedo.",
};

Deno.test("buildCoachSystemPrompt includes user name", () => {
  assertStringIncludes(buildCoachSystemPrompt(testContext), "Laura");
});

Deno.test("buildCoachSystemPrompt includes life path number", () => {
  assertStringIncludes(buildCoachSystemPrompt(testContext), "7");
});

Deno.test("buildCoachSystemPrompt includes archetype name", () => {
  assertStringIncludes(buildCoachSystemPrompt(testContext), "El Analista Profundo");
});

Deno.test("buildCoachSystemPrompt includes shadow", () => {
  assertStringIncludes(buildCoachSystemPrompt(testContext), "Parálisis por análisis");
});

Deno.test("buildCoachSystemPrompt includes methodology limits", () => {
  assertStringIncludes(buildCoachSystemPrompt(testContext), "No haces predicciones");
});

Deno.test("buildCoachSystemPrompt includes format rule", () => {
  assertStringIncludes(buildCoachSystemPrompt(testContext), "Responde en español");
});

Deno.test("buildSummarizePrompt includes sombra keyword", () => {
  assertStringIncludes(buildSummarizePrompt(), "sombra");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd supabase/functions
deno test _shared/prompts.test.ts
```

Expected: Error — module `./prompts.ts` not found.

- [ ] **Step 3: Create `_shared/prompts.ts`**

```typescript
export interface CoachContext {
  name: string;
  lifePathNumber: number;
  archetype: string;
  archetypePowers: string[];
  archetypeShadow: string;
  archetypeCoachingNote: string;
}

export function buildCoachSystemPrompt(ctx: CoachContext): string {
  const powersBlock = ctx.archetypePowers.map((p) => `- ${p}`).join("\n");

  return `Eres el Brave Path Coach de Arithmos.
Tu marco es MADM (Mente, Alma, Dios, Materia): integración de psicología aplicada,
inteligencia estratégica, y numerología determinista.
Tu misión: llevar al usuario de confusión → claridad → decisión → acción.

Operas con confrontación compasiva: eres directo, incisivo, nunca condescendiente.
Sin positividad tóxica. Sin sermones. Sin consejos obvios.
Usas los frameworks H.E.R.O. (Honesty, Empathy, Responsibility, Ownership),
C.A.L.M. (Clarity, Action, Leverage, Momentum) y
P.A.S.S. (Pattern, Assumption, Shadow, Step) cuando son relevantes.
Haces preguntas que incomodan porque revelan lo que el usuario ya sabe pero evita.

El usuario se llama ${ctx.name}. Su Camino de Vida es el ${ctx.lifePathNumber}: ${ctx.archetype}.

Sus poderes estratégicos:
${powersBlock}

Su sombra principal: ${ctx.archetypeShadow}

Nota de coaching: ${ctx.archetypeCoachingNote}

Referencia activamente su arquetipo cuando sea relevante. No en cada mensaje,
pero sí cuando el patrón de sombra aparezca o cuando sus fortalezas sean clave para avanzar.

Límites metodológicos:
- Solo orientación estratégica basada en patrones observables.
- No haces predicciones sobre eventos futuros específicos.
- No das consejos médicos, legales ni financieros.
- Si el usuario pide una predicción, redirige al análisis del patrón actual:
  "No puedo predecir lo que pasará, pero sí puedo ayudarte a ver el patrón que te trajo aquí."

Formato:
- Respuestas cortas: 1 párrafo máximo salvo que sea imprescindible extenderse.
- Termina frecuentemente (no siempre) con una pregunta profunda y específica.
- No repitas lo que el usuario dijo. Ve directo al núcleo.
- Responde en español.`;
}

export function buildSummarizePrompt(): string {
  return `Eres el Brave Path Coach de Arithmos.
Resume la siguiente conversación en un párrafo conciso enfocado en:
1. El patrón de sombra que apareció.
2. El aprendizaje u objetivo concreto establecido.
Sé directo y analítico. Sin saludos. Sin positividad vacía.`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd supabase/functions
deno test _shared/prompts.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/prompts.ts supabase/functions/_shared/prompts.test.ts
git commit -m "feat(maestro): add Brave Path Coach prompt builder"
```

---

### Task 4: calculate-blueprint Edge Function

**Files:**
- Create: `supabase/functions/calculate-blueprint/index.ts`

**Context:** Replaces the n8n `arithmos-calculate` webhook for numerology calculations. Pure math — no AI, no auth required. Called by `useProfile.ts` during registration. Input: `{ name, birthDate }`. Output: `{ lifePathNumber, expressionNumber, soulUrgeNumber, personalityNumber, archetype, archetypeDescription }`.

- [ ] **Step 1: Create the Edge Function**

Create `supabase/functions/calculate-blueprint/index.ts`:

```typescript
import { getSafeCorsHeaders } from "../_shared/cors.ts";
import { calculateLifePath, calculateNameValue, reduceToSingleDigitOrMaster } from "../_shared/numerology.ts";
import { ARCHETYPES } from "../_shared/archetypes.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = getSafeCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { name, birthDate } = body as { name?: string; birthDate?: string };

    if (!name || typeof name !== "string" || name.trim() === "") {
      return new Response(
        JSON.stringify({ error: "name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!birthDate || typeof birthDate !== "string") {
      return new Response(
        JSON.stringify({ error: "birthDate is required (YYYY-MM-DD)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lifePathNumber = calculateLifePath(birthDate);
    const expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "all"));
    const soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "vowels"));
    const personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "consonants"));

    const archetypeEntry = ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1];

    return new Response(
      JSON.stringify({
        lifePathNumber,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        archetype: archetypeEntry.name,
        archetypeDescription: archetypeEntry.description,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("Error in calculate-blueprint:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
```

- [ ] **Step 2: Test locally with Supabase CLI**

In one terminal:
```bash
supabase functions serve calculate-blueprint --no-verify-jwt
```

In a second terminal — happy path:
```bash
curl -s -X POST http://127.0.0.1:54321/functions/v1/calculate-blueprint \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","birthDate":"1990-01-15"}'
```

Expected (verify manually):
```json
{
  "lifePathNumber": 8,
  "expressionNumber": 6,
  "soulUrgeNumber": 11,
  "personalityNumber": 4,
  "archetype": "El Ejecutor de Poder",
  "archetypeDescription": "Manifestador de abundancia y autoridad. Entiendes las leyes del poder material y las usas con precisión quirúrgica."
}
```

Missing field returns 400:
```bash
curl -s -X POST http://127.0.0.1:54321/functions/v1/calculate-blueprint \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria"}'
```

Expected: `{"error":"birthDate is required (YYYY-MM-DD)"}` with HTTP 400.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/calculate-blueprint/index.ts
git commit -m "feat(maestro): add calculate-blueprint Edge Function replacing n8n webhook"
```

---

### Task 5: Migrate chat-coach to Claude

**Files:**
- Modify: `supabase/functions/deno.json`
- Modify: `supabase/functions/chat-coach/index.ts`
- Modify: `supabase/functions/_shared/token-tracker.ts`

**Context:** Replace `import OpenAI from "openai"` with `import Anthropic from "npm:@anthropic-ai/sdk"`. Expand the `context` object to use the new `CoachContext` interface. Adapt streaming from OpenAI's `for await` loop to Anthropic's `stream.on("text")` + `stream.finalMessage()`. Update `token-tracker.ts` with Claude model rates. You need `ANTHROPIC_API_KEY` set in Supabase secrets.

**Prerequisite — set Anthropic API key in Supabase secrets:**
```bash
supabase secrets set ANTHROPIC_API_KEY=<your-key>
```

- [ ] **Step 1: Add Anthropic SDK to `deno.json`**

Open `supabase/functions/deno.json`. Add `"@anthropic-ai/sdk": "npm:@anthropic-ai/sdk"` to the `imports` block. Full file:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window", "deno.ns"],
    "strict": false
  },
  "imports": {
    "@supabase/functions-js": "jsr:@supabase/functions-js@^2",
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@2",
    "stripe": "npm:stripe@^14",
    "openai": "npm:openai@^4",
    "@anthropic-ai/sdk": "npm:@anthropic-ai/sdk"
  }
}
```

- [ ] **Step 2: Replace `chat-coach/index.ts`**

Replace the entire file with:

```typescript
import { createClient } from "jsr:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import { getSafeCorsHeaders } from "../_shared/cors.ts";
import { sanitizePromptInput } from "../_shared/sanitize.ts";
import { logTokenUsage } from "../_shared/token-tracker.ts";
import { buildCoachSystemPrompt, buildSummarizePrompt, type CoachContext } from "../_shared/prompts.ts";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

Deno.serve(async (req: Request) => {
  const corsHeaders = getSafeCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    let body: {
      messages?: Array<{ role: string; content: string }>;
      action?: string;
      context?: Partial<CoachContext>;
    };
    try {
      body = JSON.parse(bodyText);
    } catch (_e) {
      console.error("No se pudo parsear JSON:", bodyText);
      throw new Error("Invalid JSON body");
    }

    const { messages = [], action = "chat", context = {} } = body;

    // --- AUTH & USER_ID ---
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) {
        console.warn("No se pudo extraer userId del token:", (e as Error).message);
      }
    }

    // --- SUMMARIZE ---
    if (action === "summarize") {
      const conversationText = (Array.isArray(messages) ? messages : [])
        .map((m) => `${m.role === "user" ? "Usuario" : "Coach"}: ${m.content}`)
        .join("\n\n");

      const summaryReq = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: buildSummarizePrompt(),
        messages: [{ role: "user", content: conversationText }],
      });

      await logTokenUsage(
        userId,
        "coach_summarize",
        "claude-haiku-4-5-20251001",
        summaryReq.usage.input_tokens,
        summaryReq.usage.output_tokens,
      );

      const block = summaryReq.content[0];
      const summary = block.type === "text" ? block.text : "";

      return new Response(
        JSON.stringify({ summary }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- CHAT (STREAMING) ---
    const safeContext: CoachContext = {
      name: sanitizePromptInput(context.name || "Usuario"),
      lifePathNumber: typeof context.lifePathNumber === "number" ? context.lifePathNumber : 1,
      archetype: context.archetype || "El Pionero",
      archetypePowers: Array.isArray(context.archetypePowers) ? context.archetypePowers : [],
      archetypeShadow: context.archetypeShadow || "",
      archetypeCoachingNote: context.archetypeCoachingNote || "",
    };

    const chatMessages = (Array.isArray(messages) ? messages : []) as Array<{
      role: "user" | "assistant";
      content: string;
    }>;

    const claudeStream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildCoachSystemPrompt(safeContext),
      messages: chatMessages,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          claudeStream.on("text", (text) => {
            controller.enqueue(encoder.encode(text));
          });

          const finalMsg = await claudeStream.finalMessage();
          await logTokenUsage(
            userId,
            "coach_chat_stream",
            "claude-sonnet-4-6",
            finalMsg.usage.input_tokens,
            finalMsg.usage.output_tokens,
          );

          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing request";
    console.error("Error en chat-coach:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
```

- [ ] **Step 3: Add Claude rates to `token-tracker.ts`**

Open `supabase/functions/_shared/token-tracker.ts`. Replace the `rates` object (currently on lines 22-27) with:

```typescript
const rates: Record<string, { prompt: number; completion: number }> = {
  "gpt-4o": { prompt: 5.0, completion: 15.0 },
  "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
  "gpt-4-turbo": { prompt: 10.0, completion: 30.0 },
  "claude-sonnet-4-6": { prompt: 3.0, completion: 15.0 },
  "claude-haiku-4-5-20251001": { prompt: 0.80, completion: 4.0 },
  "default": { prompt: 10.0, completion: 30.0 },
};
```

- [ ] **Step 4: Test locally with Supabase CLI**

Create a local env file at `supabase/.env.local` if it doesn't exist, and ensure it has `ANTHROPIC_API_KEY=sk-ant-...`.

Start the function:
```bash
supabase functions serve chat-coach --env-file supabase/.env.local
```

Test streaming chat:
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/chat-coach \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "messages": [{"role": "user", "content": "Tengo miedo de lanzar mi proyecto."}],
    "context": {
      "name": "Carlos",
      "lifePathNumber": 7,
      "archetype": "El Analista Profundo",
      "archetypePowers": ["Diagnóstico preciso", "resiliencia ante presión social"],
      "archetypeShadow": "Parálisis por análisis",
      "archetypeCoachingNote": "Confrontar la diferencia entre necesito más datos y tengo miedo."
    }
  }'
```

Expected: Streaming text in Spanish. Not empty. Tone is direct, not generic affirmations.

Test summarize:
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/chat-coach \
  -H "Content-Type: application/json" \
  -d '{
    "action": "summarize",
    "messages": [
      {"role": "user", "content": "Tengo miedo de lanzar mi proyecto."},
      {"role": "assistant", "content": "¿Cuánto tiempo llevas esperando el momento perfecto?"},
      {"role": "user", "content": "Dos años ya."}
    ]
  }'
```

Expected: `{"summary":"..."}` JSON with a concise paragraph mentioning a shadow pattern.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/deno.json \
        supabase/functions/chat-coach/index.ts \
        supabase/functions/_shared/token-tracker.ts
git commit -m "feat(maestro): migrate chat-coach to Claude Sonnet 4.6 with Brave Path Coach prompt"
```

---

### Task 6: Frontend Archetype Context Map

**Files:**
- Create: `src/lib/archetypes.ts`
- Create: `src/lib/archetypes.test.ts`

**Context:** `src/lib/archetypes.ts` provides `powers`, `shadow`, and `coachingNote` keyed by life path number. Used by `useCoachSession.ts` to enrich the context object sent to chat-coach. DB schema is not changed — these fields are never persisted.

- [ ] **Step 1: Write the failing test**

Create `src/lib/archetypes.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { ARCHETYPE_CONTEXT } from "./archetypes";

describe("ARCHETYPE_CONTEXT", () => {
  it("has all 12 archetype entries", () => {
    const keys = Object.keys(ARCHETYPE_CONTEXT).map(Number);
    expect(keys).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]));
    expect(keys.length).toBe(12);
  });

  it("every entry has powers array, shadow string, coachingNote string", () => {
    for (const key of Object.keys(ARCHETYPE_CONTEXT)) {
      const entry = ARCHETYPE_CONTEXT[Number(key)];
      expect(Array.isArray(entry.powers)).toBe(true);
      expect(entry.powers.length).toBeGreaterThan(0);
      expect(typeof entry.shadow).toBe("string");
      expect(entry.shadow.length).toBeGreaterThan(0);
      expect(typeof entry.coachingNote).toBe("string");
      expect(entry.coachingNote.length).toBeGreaterThan(0);
    }
  });

  it("archetype 7 shadow mentions paralysis", () => {
    expect(ARCHETYPE_CONTEXT[7].shadow).toContain("Parálisis");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/archetypes.test.ts
```

Expected: FAIL — cannot find module `./archetypes`.

- [ ] **Step 3: Create `src/lib/archetypes.ts`**

```typescript
export interface ArchetypeContext {
  powers: string[];
  shadow: string;
  coachingNote: string;
}

export const ARCHETYPE_CONTEXT: Record<number, ArchetypeContext> = {
  1: {
    powers: ["Iniciativa irrefrenable", "capacidad de actuar antes de tener certeza", "autoridad natural bajo presión"],
    shadow: "Individualismo destructivo — necesita tenerlo todo bajo control y no delega hasta que es demasiado tarde.",
    coachingNote: "Confrontar la diferencia entre liderazgo y control. Preguntar: ¿estás liderando o simplemente asegurándote de que nadie te falle?",
  },
  2: {
    powers: ["Lectura fina de dinámicas interpersonales", "capacidad de construir coaliciones", "intuición estratégica para timing"],
    shadow: "Evita el conflicto a costo de su propia posición — cede cuando debería sostener.",
    coachingNote: "Confrontar el patrón de apaciguamiento. Preguntar: ¿estás siendo diplomático o simplemente evitando decir lo que realmente piensas?",
  },
  3: {
    powers: ["Narración persuasiva", "síntesis creativa de conceptos complejos", "capacidad de generar momentum social"],
    shadow: "Dispersión — arranca múltiples proyectos con energía pero no termina ninguno.",
    coachingNote: "Confrontar la diferencia entre creatividad productiva y evitar el compromiso. Preguntar: ¿cuántos proyectos \"en proceso\" tienes que en realidad ya abandonaste?",
  },
  4: {
    powers: ["Construcción de procesos escalables", "consistencia bajo presión", "capacidad de sostener esfuerzo donde otros abandonan"],
    shadow: "Rigidez — se aferra a sistemas que ya no sirven por miedo al caos del cambio.",
    coachingNote: "Confrontar la diferencia entre disciplina y resistencia al cambio. Preguntar: ¿este sistema que defiendes aún te sirve, o ya es solo lo que conoces?",
  },
  5: {
    powers: ["Adaptabilidad extrema", "lectura rápida de oportunidades emergentes", "capacidad de pivote sin parálisis"],
    shadow: "Inestabilidad crónica — huye del compromiso y la profundidad disfrazándolo de \"libertad\".",
    coachingNote: "Confrontar el patrón de escape. Preguntar: ¿tu próximo movimiento es una oportunidad real o simplemente estás huyendo de lo que requiere más de ti?",
  },
  6: {
    powers: ["Visión sistémica de relaciones y dependencias", "capacidad de sostener roles de liderazgo emocional", "confianza que genera en otros"],
    shadow: "Martirio voluntario — carga responsabilidades ajenas hasta el agotamiento para sentirse necesario.",
    coachingNote: "Confrontar la diferencia entre servicio y necesidad de ser indispensable. Preguntar: ¿a quién estás ayudando realmente, o es esta carga una forma de validarte?",
  },
  7: {
    powers: ["Diagnóstico preciso de sistemas complejos", "toma de decisiones desde evidencia no ruido", "resiliencia ante presión social"],
    shadow: "Parálisis por análisis — usa la investigación como escudo contra la acción.",
    coachingNote: "Confrontar la diferencia entre \"necesito más datos\" y \"tengo miedo de equivocarme\". Preguntar: ¿qué certeza exacta necesitas para moverte?",
  },
  8: {
    powers: ["Orientación a resultados tangibles", "capacidad de tomar decisiones de alto impacto bajo presión", "magnetismo de recursos"],
    shadow: "Abuso de poder o colapso — opera en extremos: domina o se rinde completamente.",
    coachingNote: "Confrontar la relación con la autoridad y el fracaso. Preguntar: cuando pierdes control de una situación, ¿qué historia te cuentas sobre ti mismo?",
  },
  9: {
    powers: ["Pensamiento de largo plazo y alto impacto", "capacidad de inspirar movimientos", "integración de perspectivas opuestas"],
    shadow: "Evasión de lo concreto — se pierde en la visión y nunca baja a la ejecución.",
    coachingNote: "Confrontar la distancia entre visión y acción. Preguntar: ¿cuál es el primer paso específico esta semana, no el plan de los próximos cinco años?",
  },
  11: {
    powers: ["Intuición estratégica de alto nivel", "capacidad de inspirar con autenticidad", "percepción de dinámicas que otros no ven"],
    shadow: "Ansiedad por el propósito — la grandeza del potencial paraliza en lugar de movilizar.",
    coachingNote: "Confrontar la brecha entre potencial y acción. Preguntar: ¿qué harías hoy si no sintieras la presión de estar a la altura de quien \"deberías\" ser?",
  },
  22: {
    powers: ["Arquitectura de proyectos de escala", "disciplina sostenida en el tiempo", "capacidad de aterrizar lo visionario en lo estructural"],
    shadow: "Perfeccionismo paralizante — el estándar propio es tan alto que nada es suficiente para empezar.",
    coachingNote: "Confrontar la diferencia entre excelencia y perfeccionismo defensivo. Preguntar: ¿qué versión imperfecta de esto podría lanzar hoy?",
  },
  33: {
    powers: ["Impacto emocional profundo", "capacidad de sostener espacios de transformación", "autoridad moral genuina"],
    shadow: "Auto-sacrificio extremo — da hasta el agotamiento total y resiente a quienes no lo reconocen.",
    coachingNote: "Confrontar el límite entre servicio y negación del yo. Preguntar: ¿qué necesitas tú ahora mismo, antes de pensar en lo que necesitan los demás?",
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/lib/archetypes.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/archetypes.ts src/lib/archetypes.test.ts
git commit -m "feat(maestro): add frontend archetype context map"
```

---

### Task 7: Expand chat context in useCoachSession.ts

**Files:**
- Modify: `src/hooks/useCoachSession.ts`

**Context:** `sendMessage` currently sends `{ name, lifePath }` to chat-coach (lines 143-146). This does not match the new `CoachContext` interface. Replace with the full context including `archetypePowers`, `archetypeShadow`, `archetypeCoachingNote` — looked up from `ARCHETYPE_CONTEXT` using `profile.lifePathNumber`.

- [ ] **Step 1: Add import to `useCoachSession.ts`**

Add after line 5 (`import { toast } from "sonner";`):

```typescript
import { ARCHETYPE_CONTEXT } from "@/lib/archetypes";
```

- [ ] **Step 2: Replace the context object inside `sendMessage`**

Find these lines (around line 143):
```typescript
context: {
    name: profile?.name,
    lifePath: profile?.lifePathNumber
}
```

Replace with:
```typescript
context: (() => {
  const lpn = profile?.lifePathNumber ?? 1;
  const ctx = ARCHETYPE_CONTEXT[lpn] ?? ARCHETYPE_CONTEXT[1];
  return {
    name: profile?.name,
    lifePathNumber: lpn,
    archetype: profile?.archetype,
    archetypePowers: ctx.powers,
    archetypeShadow: ctx.shadow,
    archetypeCoachingNote: ctx.coachingNote,
  };
})()
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors related to `useCoachSession.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCoachSession.ts
git commit -m "feat(maestro): pass full archetype context to chat-coach"
```

---

### Task 8: Replace n8n with calculate-blueprint in useProfile.ts

**Files:**
- Modify: `src/hooks/useProfile.ts`

**Context:** `createProfile` currently: (1) calculates locally as fallback, then (2) retries n8n up to 2x for AI narrative. The new flow: single call to `calculate-blueprint`, no retry, no local fallback. If it fails → throw so the caller (`Register.tsx`) can surface the error. The `syncBlueprintIA` function stays unchanged — it still uses n8n for AI narrative generation. The exported calculation functions (`calculateLifePath`, etc.) are also kept — used by 6 other components.

- [ ] **Step 1: Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY imports**

Open `src/hooks/useProfile.ts`. Find:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

Replace with:
```typescript
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
```

- [ ] **Step 2: Replace `createProfile` function**

Find the entire `createProfile` function (starts at `const createProfile = useCallback(async (name: string, birthDate: string, userId?: string, phone?: string) => {` and ends at `}, []);`). Replace with:

```typescript
const createProfile = useCallback(async (name: string, birthDate: string, userId?: string, phone?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token || SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/calculate-blueprint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name, birthDate }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `calculate-blueprint failed: ${response.status}`);
  }

  const result = await response.json() as {
    lifePathNumber: number;
    expressionNumber: number;
    soulUrgeNumber: number;
    personalityNumber: number;
    archetype: string;
    archetypeDescription: string;
  };

  const newProfile: Profile = {
    userId: userId || "",
    name,
    birthDate,
    lifePathNumber: result.lifePathNumber,
    expressionNumber: result.expressionNumber,
    soulUrgeNumber: result.soulUrgeNumber,
    personalityNumber: result.personalityNumber,
    archetype: result.archetype,
    description: result.archetypeDescription,
    createdAt: new Date().toISOString(),
    phone: phone,
  };

  sessionStorage.setItem("arithmos_profile", JSON.stringify(newProfile));
  setProfile({ ...newProfile });

  if (userId && session) {
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          name,
          birth_date: birthDate,
          life_path_number: result.lifePathNumber,
          expression_number: result.expressionNumber,
          soul_urge_number: result.soulUrgeNumber,
          personality_number: result.personalityNumber,
          archetype: result.archetype,
          archetype_description: result.archetypeDescription,
          phone: phone ?? null,
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      console.warn("Error upserting profile:", upsertError.message);
    }
  }

  return newProfile;
}, []);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test registration flow end-to-end**

Start the dev server:
```bash
npm run dev
```

1. Go to `/register`
2. Fill in: Nombre, Fecha de nacimiento, Email, Contraseña
3. Click "Calcular mi Blueprint →"
4. Verify: page transitions to Aha Moment with a life path number shown
5. Open Supabase dashboard → Table Editor → `profiles` — confirm new row has `life_path_number`, `expression_number`, `soul_urge_number`, `personality_number` all populated (not null)
6. Verify browser console has no 500 errors

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useProfile.ts
git commit -m "feat(maestro): replace n8n webhook with calculate-blueprint in createProfile"
```
