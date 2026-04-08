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
