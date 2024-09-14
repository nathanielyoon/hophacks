import {
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "jsr:@std/assert@^1.0.0";
import { base58, base58_buffer, buffer_base58 } from "../lib/58.ts";
import { LOOP, read, test } from "./test.ts";

test("base58", async () => {
  assertMatch("", base58, "empty ok");
  assertMatch(
    /pszBase58 = "(\w+)"/.exec(await read("base58.cpp"))![1],
    base58,
    "source ok",
  );
  for (const a of "0IOl") assertNotMatch(a, base58, "exclude");
});
test(buffer_base58, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z <= LOOP; ++z) {
    assertMatch(buffer_base58(rng.array(a.subarray(z))), base58, "regex");
  }
});
test(base58_buffer, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z <= LOOP; ++z) {
    const b = rng.array(a.subarray(z));
    assertEquals(base58_buffer(buffer_base58(b)), b, "back to same bytes");
  }
  assertEquals(
    base58_buffer(buffer_base58(new Uint8Array([0]))),
    new Uint8Array([0]),
    "short",
  );
  assertEquals(base58_buffer("1"), new Uint8Array(), "shorter");
  assertEquals(
    base58_buffer(buffer_base58(new Uint8Array(LOOP))),
    new Uint8Array(LOOP),
    "empty ok",
  );
  assertEquals(
    base58_buffer(buffer_base58(new Uint8Array(LOOP).fill(-1))),
    new Uint8Array(LOOP).fill(-1),
    "full ok",
  );
});
