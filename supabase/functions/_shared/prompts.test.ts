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
