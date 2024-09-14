import { next } from "../lib/hash.ts";

export const SEED = +Deno.args[0] || Math.random() * 0x100000000 >>> 0;
export const LOOP = +Deno.args[1] || 0x100;
export const SIZE = +Deno.args[2] || LOOP >>> 2 || 64;
export const UNIT = +Deno.args[3] || SIZE >>> 2 || 16;
export const cs = crypto.subtle;
export const fcc = String.fromCharCode;
export const BASE = import.meta.url.replace(
  /^file:\/\/((?:\/\w+)+)\/src\/test\/test\.ts$/,
  "$1",
);
export const LONG = Deno.env.get("TABBER_LONG_TEST") ?? "";
export const read = (file: string) =>
  Deno.readTextFile(`${BASE}/public/static/${file}`);
export class RNG {
  static hex = (seed: number) => seed.toString(16).charCodeAt(0);
  static lower = (seed: number) => seed % 26 + 97;
  static alpha = (seed: number) => seed % 26 + (seed & 0x20 ? 65 : 97);
  static ascii = (seed: number) => seed % 94 + 33;
  static unicode = (seed: number) => seed & 0x3ffff;
  state;
  constructor(public seed: number) {
    this.state = next(seed || 1);
  }
  number() {
    return this.state = next(this.state);
  }
  array<A extends { [_: number]: number; length: number }>(into: A) {
    for (let z = 0; z < into.length; ++z) into[z] = this.number();
    return into;
  }
  string(character = RNG.ascii) {
    return (length = UNIT) => {
      let a = "";
      for (let z = 0; z < length; ++z) {
        a += String.fromCodePoint(character(this.number()));
      }
      return a;
    };
  }
}
export const test = (name: string | Function, fn: (rng: RNG) => unknown) =>
  Deno.test(name = typeof name === "string" ? name : name.name, async () => {
    try {
      await fn(new RNG(SEED));
    } catch (Z) {
      console.log(name, SEED);
      throw Z;
    }
  });
export const shuffle = (rng: RNG) => <A>(source: A[]) => {
  const a = source.length;
  const b = Array<A>(a);
  for (let z = 0; z < a; ++z) {
    const c = rng.number() % -~z;
    if (c !== z) b[z] = b[c];
    b[c] = source[z];
  }
  return b;
};
