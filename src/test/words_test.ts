import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { decode, encode, LIST } from "../lib/words.ts";
import { LOOP, read, test } from "./test.ts";

test("list", async () => {
  const a = new Set((await Promise.all([
    read("eff_short_wordlist_1.txt"),
    read("bip-0039-english.txt"),
  ])).flatMap((Z) =>
    Z.split("\n").filter((Y) => /\S/.test(Y)).map((Y) =>
      Y.replace(/^\d{4}./, "")
    )
  ));
  for (let z = 0; z < LIST.length; ++z) assert(a.has(LIST[z]), "one of them");
});
test(`${encode.name} ${decode.name}`, (rng) => {
  for (let z = 0; z < LOOP; ++z) {
    for (
      const b of [
        z,
        z * 1234567889,
        rng.number() + (rng.number() >>> 16) * 0x100000000,
        0x1000000000000 - z,
        0x1000000000000 - z * 1234567889,
      ]
    ) {
      const c = encode(b), d = c.split("-");
      // assertEquals(new Set(d).size, d.length, "different");
      assertEquals(decode(c), b, "same");
    }
  }
});
