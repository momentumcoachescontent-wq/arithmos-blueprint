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
