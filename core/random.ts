export type RNG = () => number;

// Create a random seed using crypto.getRandomValues
export function makeSeed(): string {
  const buf = new Uint32Array(4);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((n) => n.toString(36)).join('');
}

// Create deterministic pseudo RNG from seed using xorshift32
export function createRNG(seed: string): RNG {
  let x = 0;
  for (const ch of seed) {
    x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  }
  if (x === 0) x = 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

export function randomInt(rng: RNG, max: number): number {
  return rng() % max;
}

export function shuffle<T>(rng: RNG, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
