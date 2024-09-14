import {
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "jsr:@std/assert@^1.0.0";
import { base91, base91_buffer } from "../lib/91.ts";
import { LOOP, read, test } from "./test.ts";
import { buffer_base91 } from "../lib/91.ts";

test("base91", async () => {
  assertMatch("", base91, "empty ok");
  assertMatch("", base91, "source ok");
  assertMatch(
    (await read("base91.hs")).match(
      /(?<=alphabet = \[[\n -~]+?')([ -~])(?='[\n -~]*?\]\n\n)/g,
    )!.join(""),
    base91,
    "source ok",
  );
  for (const a of "'-\\") assertNotMatch(a, base91, "exclude");
});
test(buffer_base91, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z < LOOP; ++z) {
    assertMatch(buffer_base91(rng.array(a.subarray(z))), base91, "regex");
  }
});
test(base91_buffer, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z < LOOP; ++z) {
    const b = rng.array(a.subarray(z));
    assertEquals(base91_buffer(buffer_base91(b)), b, "back to same bytes");
  }
  assertEquals(
    base91_buffer(buffer_base91(new Uint8Array([0]))),
    new Uint8Array([0]),
    "short",
  );
  assertEquals(
    base91_buffer(buffer_base91(new Uint8Array(LOOP))),
    new Uint8Array(LOOP),
    "empty ok",
  );
  assertEquals(
    base91_buffer(buffer_base91(new Uint8Array(LOOP).fill(-1))),
    new Uint8Array(LOOP).fill(-1),
    "full ok",
  );
});
