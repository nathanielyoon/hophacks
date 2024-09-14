import { assertEquals, assertMatch } from "jsr:@std/assert@^1.0.0";
import { fcc, LOOP, read, test } from "./test.ts";
import { a_s64, s64_a } from "../lib/64.ts";

test("rfc 4648", async () => {
  const a = await read("rfc4648.txt");
  for (const b of a.matchAll(/BASE64\("(\w+)"\) = "(\w+)=*"/g)) {
    const c = new TextEncoder().encode(b[1]);
    assertEquals(a_s64(c), b[2], "encodes");
    assertEquals(s64_a(b[2]), c, "decodes");
  }
});
test(a_s64, (rng) => {
  const a = new Uint8Array(LOOP);
  for (let z = 0; z < LOOP; ++z) {
    assertMatch(a_s64(rng.array(a.subarray(z))), /^[-\w]*$/, "regex");
  }
});
test(s64_a, (rng) => {
  const a = new Uint8Array(LOOP >>> 1 || 1);
  for (let z = 0; z <= (LOOP >>> 1 || 1); ++z) {
    const c = a.subarray(z);
    const d = a_s64(rng.array(c));
    assertEquals(
      d,
      btoa(c.reduce((Z, Y) => Z + fcc(Y), ""))
        .replaceAll("+", "-").replaceAll("/", "_").replace(/=?=$/, ""),
    );
    const e = s64_a(d);
    assertEquals(
      e,
      Uint8Array.from(
        atob(d.replaceAll("-", "+").replaceAll("_", "/")),
        (Z) => Z.charCodeAt(0),
      ),
    );
    assertEquals(e, c, "back to same bytes");
  }
  assertEquals(s64_a(a_s64(new Uint8Array([0]))), new Uint8Array([0]), "short");
  assertEquals(s64_a("A"), new Uint8Array(), "shorter");
});
