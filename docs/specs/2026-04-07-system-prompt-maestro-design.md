# System Prompt Maestro — Design Spec
**Date:** 2026-04-07
**Project:** Arithmos Blueprint · Plan Maestro V2.1
**Status:** Approved

---

## Context

The current `chat-coach` Edge Function uses OpenAI GPT-4o with a minimal hardcoded system prompt ("Coach MADM") that does not reference the user's archetype or life path number. Blueprint calculation lives partly in the frontend (`useProfile.ts`) and partly in an n8n webhook (`arithmos-calculate`), creating fragile duplication and an external dependency.

This spec covers two changes:
1. **System Prompt Maestro** — migrate `chat-coach` to Claude Sonnet 4.6 with the Brave Path Coach prompt and active archetype injection.
2. **Blueprint Edge Function** — replace the n8n `arithmos-calculate` webhook with a deterministic Supabase Edge Function.

---

## Scope

### In scope
- `supabase/functions/_shared/archetypes.ts` — archetype knowledge base (12 archetypes)
- `supabase/functions/_shared/prompts.ts` — Brave Path Coach prompt builder
- `supabase/functions/_shared/numerology.ts` — deterministic calculation logic (moved from frontend)
- `supabase/functions/calculate-blueprint/index.ts` — new Edge Function, replaces n8n webhook
- `supabase/functions/chat-coach/index.ts` — migrate OpenAI → Claude, inject archetype context
- `src/hooks/useProfile.ts` — update webhook URL, remove local calculation fallback

### Out of scope
- Dashboard redesign
- Stripe/MercadoPago integration
- Daily Pulse or Scanner features
- Email / push notification flows

---

## Architecture

```
Frontend (Register.tsx)
  └─ useProfile.ts
       └─ POST /functions/v1/calculate-blueprint
            └─ _shared/numerology.ts  (math)
            └─ _shared/archetypes.ts  (knowledge base)
            → { lifePathNumber, archetype, archetypeDescription, ... }

Frontend (Dashboard chat)
  └─ POST /functions/v1/chat-coach  { messages, action, context }
       └─ _shared/prompts.ts         (builds system prompt)
       └─ _shared/archetypes.ts      (look up archetype detail)
       └─ Claude API (claude-sonnet-4-6, streaming)
       → text/event-stream
```

Both Edge Functions share the same `_shared/` modules. No logic is duplicated between frontend and backend.

---

## Section 1: Archetype Knowledge Base — `_shared/archetypes.ts`

### Data Shape

```typescript
export interface Archetype {
  name: string;           // Display name, e.g. "El Analista Profundo"
  description: string;    // Short profile paragraph
  powers: string[];       // 2–3 strategic strengths
  shadow: string;         // Core blind spot the coach confronts
  coachingNote: string;   // How to approach this archetype in coaching
}

export const ARCHETYPES: Record<number, Archetype> = { ... }
```

### The 12 Archetypes

**1 — El Pionero**
- description: Líder nato con una voluntad inquebrantable. Tu energía es la de quien abre caminos donde nadie ve posibilidad.
- powers: Iniciativa irrefrenable, capacidad de actuar antes de tener certeza, autoridad natural bajo presión.
- shadow: Individualismo destructivo — necesita tenerlo todo bajo control y no delega hasta que es demasiado tarde.
- coachingNote: Confrontar la diferencia entre liderazgo y control. Preguntar: ¿estás liderando o simplemente asegurándote de que nadie te falle?

**2 — El Diplomático**
- description: Maestro de la cooperación y la intuición sutil. Tu poder reside en la capacidad de ver lo que otros ignoran en las relaciones.
- powers: Lectura fina de dinámicas interpersonales, capacidad de construir coaliciones, intuición estratégica para timing.
- shadow: Evita el conflicto a costo de su propia posición — cede cuando debería sostener.
- coachingNote: Confrontar el patrón de apaciguamiento. Preguntar: ¿estás siendo diplomático o simplemente evitando decir lo que realmente piensas?

**3 — El Comunicador**
- description: Catalizador creativo que transforma ideas abstractas en realidades tangibles. Tu expresión es tu arma estratégica.
- powers: Narración persuasiva, síntesis creativa de conceptos complejos, capacidad de generar momentum social.
- shadow: Dispersión — arranca múltiples proyectos con energía pero no termina ninguno.
- coachingNote: Confrontar la diferencia entre creatividad productiva y evitar el compromiso. Preguntar: ¿cuántos proyectos "en proceso" tienes que en realidad ya abandonaste?

**4 — El Arquitecto de Sistemas**
- description: Constructor metódico de estructuras duraderas. Tu disciplina y visión a largo plazo son tu ventaja competitiva definitiva.
- powers: Construcción de procesos escalables, consistencia bajo presión, capacidad de sostener esfuerzo donde otros abandonan.
- shadow: Rigidez — se aferra a sistemas que ya no sirven por miedo al caos del cambio.
- coachingNote: Confrontar la diferencia entre disciplina y resistencia al cambio. Preguntar: ¿este sistema que defiendes aún te sirve, o ya es solo lo que conoces?

**5 — El Agente de Cambio**
- description: Adaptable y magnético. Prosperas en el caos y conviertes la incertidumbre en oportunidad donde otros ven riesgo.
- powers: Adaptabilidad extrema, lectura rápida de oportunidades emergentes, capacidad de pivote sin parálisis.
- shadow: Inestabilidad crónica — huye del compromiso y la profundidad disfrazándolo de "libertad".
- coachingNote: Confrontar el patrón de escape. Preguntar: ¿tu próximo movimiento es una oportunidad real o simplemente estás huyendo de lo que requiere más de ti?

**6 — El Estratega del Equilibrio**
- description: Armonizador nato que entiende que el verdadero poder está en la responsabilidad consciente y el servicio estratégico.
- powers: Visión sistémica de relaciones y dependencias, capacidad de sostener roles de liderazgo emocional, confianza que genera en otros.
- shadow: Martirio voluntario — carga responsabilidades ajenas hasta el agotamiento para sentirse necesario.
- coachingNote: Confrontar la diferencia entre servicio y necesidad de ser indispensable. Preguntar: ¿a quién estás ayudando realmente, o es esta carga una forma de validarte?

**7 — El Analista Profundo**
- description: Pensador penetrante que opera en un nivel de percepción que otros no pueden alcanzar. Tu introspección es tu superpoder.
- powers: Diagnóstico preciso de sistemas complejos, toma de decisiones desde evidencia no ruido, resiliencia ante presión social.
- shadow: Parálisis por análisis — usa la investigación como escudo contra la acción.
- coachingNote: Confrontar la diferencia entre "necesito más datos" y "tengo miedo de equivocarme". Preguntar: ¿qué certeza exacta necesitas para moverte?

**8 — El Ejecutor de Poder**
- description: Manifestador de abundancia y autoridad. Entiendes las leyes del poder material y las usas con precisión quirúrgica.
- powers: Orientación a resultados tangibles, capacidad de tomar decisiones de alto impacto bajo presión, magnetismo de recursos.
- shadow: Abuso de poder o colapso — opera en extremos: domina o se rinde completamente.
- coachingNote: Confrontar la relación con la autoridad y el fracaso. Preguntar: cuando pierdes control de una situación, ¿qué historia te cuentas sobre ti mismo?

**9 — El Visionario Global**
- description: Conciencia expandida que ve el panorama completo. Tu misión trasciende lo personal y toca lo colectivo.
- powers: Pensamiento de largo plazo y alto impacto, capacidad de inspirar movimientos, integración de perspectivas opuestas.
- shadow: Evasión de lo concreto — se pierde en la visión y nunca baja a la ejecución.
- coachingNote: Confrontar la distancia entre visión y acción. Preguntar: ¿cuál es el primer paso específico esta semana, no el plan de los próximos cinco años?

**11 — El Iluminador Maestro**
- description: Potencial magnético con una visión altamente intuitiva. Eres un puente entre lo visible y lo invisible.
- powers: Intuición estratégica de alto nivel, capacidad de inspirar con autenticidad, percepción de dinámicas que otros no ven.
- shadow: Ansiedad por el propósito — la grandeza del potencial paraliza en lugar de movilizar.
- coachingNote: Confrontar la brecha entre potencial y acción. Preguntar: ¿qué harías hoy si no sintieras la presión de estar a la altura de quien "deberías" ser?

**22 — El Constructor Maestro**
- description: Capacidad pragmática suprema para convertir visiones en imperios. Tu legado es tangible y transformador.
- powers: Arquitectura de proyectos de escala, disciplina sostenida en el tiempo, capacidad de aterrizar lo visionario en lo estructural.
- shadow: Perfeccionismo paralizante — el estándar propio es tan alto que nada es suficiente para empezar.
- coachingNote: Confrontar la diferencia entre excelencia y perfeccionismo defensivo. Preguntar: ¿qué versión imperfecta de esto podría lanzar hoy?

**33 — El Maestro Sanador**
- description: Vibración compasiva extrema. Influencia transformadora pura. Naces para elevar la conciencia de otros.
- powers: Impacto emocional profundo, capacidad de sostener espacios de transformación, autoridad moral genuina.
- shadow: Auto-sacrificio extremo — da hasta el agotamiento total y resiente a quienes no lo reconocen.
- coachingNote: Confrontar el límite entre servicio y negación del yo. Preguntar: ¿qué necesitas tú ahora mismo, antes de pensar en lo que necesitan los demás?

---

## Section 2: Prompt Templates — `_shared/prompts.ts`

### `buildCoachSystemPrompt(context: CoachContext): string`

```typescript
interface CoachContext {
  name: string;
  lifePathNumber: number;
  archetype: string;
  archetypePowers: string[];
  archetypeShadow: string;
  archetypeCoachingNote: string;
}
```

The returned string has 5 blocks concatenated:

**Block 1 — Identity**
```
Eres el Brave Path Coach de Arithmos.
Tu marco es MADM (Mente, Alma, Dios, Materia): integración de psicología aplicada,
inteligencia estratégica, y numerología determinista.
Tu misión: llevar al usuario de confusión → claridad → decisión → acción.
```

**Block 2 — Tone**
```
Operas con confrontación compasiva: eres directo, incisivo, nunca condescendiente.
Sin positividad tóxica. Sin sermones. Sin consejos obvios.
Usas los frameworks H.E.R.O. (Honesty, Empathy, Responsibility, Ownership),
C.A.L.M. (Clarity, Action, Leverage, Momentum) y
P.A.S.S. (Pattern, Assumption, Shadow, Step) cuando son relevantes.
Haces preguntas que incomodan porque revelan lo que el usuario ya sabe pero evita.
```

**Block 3 — User Archetype (dynamic)**
```
El usuario se llama {name}. Su Camino de Vida es el {lifePathNumber}: {archetype}.

Sus poderes estratégicos:
{powers.map(p => `- ${p}`).join('\n')}

Su sombra principal: {shadow}

Nota de coaching: {coachingNote}

Referencia activamente su arquetipo cuando sea relevante. No en cada mensaje,
pero sí cuando el patrón de sombra aparezca o cuando sus fortalezas sean clave para avanzar.
```

**Block 4 — Methodology Limits**
```
Límites metodológicos:
- Solo orientación estratégica basada en patrones observables.
- No haces predicciones sobre eventos futuros específicos.
- No das consejos médicos, legales ni financieros.
- Si el usuario pide una predicción, redirige al análisis del patrón actual:
  "No puedo predecir lo que pasará, pero sí puedo ayudarte a ver el patrón que te trajo aquí."
```

**Block 5 — Format**
```
Formato:
- Respuestas cortas: 1 párrafo máximo salvo que sea imprescindible extenderse.
- Termina frecuentemente (no siempre) con una pregunta profunda y específica.
- No repitas lo que el usuario dijo. Ve directo al núcleo.
- Responde en español.
```

### `buildSummarizePrompt(): string`

Fixed prompt (no dynamic injection):
```
Eres el Brave Path Coach de Arithmos.
Resume la siguiente conversación en un párrafo conciso enfocado en:
1. El patrón de sombra que apareció.
2. El aprendizaje u objetivo concreto establecido.
Sé directo y analítico. Sin saludos. Sin positividad vacía.
```

---

## Section 3: Blueprint Edge Function — `calculate-blueprint/index.ts`

Replaces n8n webhook `arithmos-calculate`. Pure deterministic math, no AI.

**Method:** POST  
**Auth:** None required (called during registration before session exists)

**Request body:**
```typescript
{ name: string; birthDate: string; }
```

**Response:**
```typescript
{
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  archetype: string;
  archetypeDescription: string;
}
```

**Logic source:** `_shared/numerology.ts` — contains `calculateLifePath`, `calculateNameValue`, `reduceToSingleDigitOrMaster`, and `PYTHAGOREAN_TABLE`. This logic is moved from `useProfile.ts` (frontend) to eliminate duplication.

**Error handling:** Returns `{ error: string }` with status 400 for missing fields, 500 for unexpected errors.

---

## Section 4: `chat-coach` Migration

### Dependency change

```typescript
// Before
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

// After
import Anthropic from "npm:@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
```

### Model mapping

| Action | Before | After |
|--------|--------|-------|
| `chat` (stream) | `gpt-4o` | `claude-sonnet-4-6` |
| `summarize` | `gpt-4o-mini` | `claude-haiku-4-5-20251001` |

### Context expansion

The `context` object sent by the frontend currently carries `name` and `lifePath`. It will carry:
```typescript
{
  name: string;
  lifePathNumber: number;
  archetype: string;          // archetype name
  archetypePowers: string[];
  archetypeShadow: string;
  archetypeCoachingNote: string;
}
```

The Edge Function uses `buildCoachSystemPrompt(context)` from `prompts.ts` to build the system message.

### Streaming adaptation

OpenAI streaming and Anthropic streaming both produce text chunks. The response format to the client does not change (`text/event-stream`, plain text chunks). Internally the loop changes:

```typescript
// Before (OpenAI)
for await (const chunk of response) {
  const content = chunk.choices[0]?.delta?.content || "";
  if (content) controller.enqueue(encoder.encode(content));
  if (chunk.usage) await logTokenUsage(...);
}

// After (Anthropic)
const stream = await anthropic.messages.stream({ ... });
stream.on("text", (text) => controller.enqueue(encoder.encode(text)));
const finalMsg = await stream.finalMessage();
await logTokenUsage(
  userId, "coach_chat_stream", "claude-sonnet-4-6",
  finalMsg.usage.input_tokens, finalMsg.usage.output_tokens
);
```

### Token logging

`logTokenUsage` model strings update from `"gpt-4o"` / `"gpt-4o-mini"` to `"claude-sonnet-4-6"` / `"claude-haiku-4-5-20251001"`.

---

## Section 5: `useProfile.ts` Changes

1. Replace n8n webhook URL with `${SUPABASE_URL}/functions/v1/calculate-blueprint`.
2. Remove local calculation fallback — the Edge Function is the single source of truth.
3. Pass Authorization header when calling `calculate-blueprint` (user may be authenticated at this point; Edge Function ignores it but the pattern stays consistent).
4. Update response parsing to match `calculate-blueprint` output shape.
5. Pass full archetype context (`archetypePowers`, `archetypeShadow`, `archetypeCoachingNote`) from the `ARCHETYPES` record when building the chat context object. These are looked up client-side from `_shared/archetypes.ts` — or the Edge Function returns them and `useProfile.ts` stores them in the profile state.

**Decision:** `calculate-blueprint` returns `archetype` and `archetypeDescription`. The richer fields (`powers`, `shadow`, `coachingNote`) are looked up client-side from a thin copy of the archetypes data — a `ARCHETYPE_CONTEXT` map exported from a new `src/lib/archetypes.ts` file (frontend-only, mirrors the powers/shadow/coachingNote from the shared file). This avoids changing the database schema and keeps the Edge Function response lean.

---

## Change Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/_shared/archetypes.ts` |
| Create | `supabase/functions/_shared/prompts.ts` |
| Create | `supabase/functions/_shared/numerology.ts` |
| Create | `supabase/functions/calculate-blueprint/index.ts` |
| Create | `src/lib/archetypes.ts` (frontend archetype context map) |
| Modify | `supabase/functions/chat-coach/index.ts` |
| Modify | `src/hooks/useProfile.ts` |

---

## Out of Scope

- Database schema changes
- Dashboard chat UI changes
- Daily Pulse or Scanner edge functions
- Stripe/MercadoPago flows
- Email flows
