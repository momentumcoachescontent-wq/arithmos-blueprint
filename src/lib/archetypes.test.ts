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
