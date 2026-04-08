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
