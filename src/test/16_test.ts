import { assertEquals, assertMatch } from "jsr:@std/assert@^1.0.0";
import { base16_buffer, buffer_base16 } from "../lib/16.ts";
import { LOOP, test } from "./test.ts";

test(buffer_base16, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z <= LOOP; ++z) {
    assertMatch(
      buffer_base16(rng.array(a.subarray(z))),
      RegExp(`^[\\da-f]{${LOOP - z << 1}}$`),
      "to string that matches base16 regex",
    );
  }
});
test(base16_buffer, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z <= LOOP; ++z) {
    const c = rng.array(a.subarray(z));
    assertEquals(base16_buffer(buffer_base16(c)), c, "to same bytes");
  }
});
