import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { exchange, generate, sign, verify } from "../lib/25519.ts";
import { cs, LOOP, read, test } from "./test.ts";

const s16_a = (hex: string) =>
  Uint8Array.from(hex.match(/../g) ?? [], (Z) => parseInt(Z, 16));
test(generate, async () => {
  await Promise.all(Array.from(
    { length: LOOP >>> 6 || 1 },
    () =>
      cs.generateKey("Ed25519", true, ["sign"]).then((Z) =>
        Promise.all([
          cs.exportKey("pkcs8", Z.privateKey),
          cs.exportKey("raw", Z.publicKey),
        ])
      ).then((Z) =>
        assertEquals(
          generate(new Uint8Array(Z[0]).subarray(16)),
          new Uint8Array(Z[1]),
        )
      ),
  ));
});
test(sign, async (rng) => {
  await Promise.all(Array.from({ length: LOOP >>> 3 || 1 }, async (_, Z) => {
    const a = rng.array(new Uint8Array(48));
    a.set([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
    const b = rng.array(new Uint8Array(Z));
    await cs.importKey("pkcs8", a, "Ed25519", false, ["sign"])
      .then((Y) => cs.sign("Ed25519", Y, b))
      .then((Y) => assertEquals(sign(a.subarray(16), b), new Uint8Array(Y)));
  }));
});
test(verify, (rng) => {
  const a = new Uint8Array(32), b = new Uint8Array(32);
  for (let z = 0; z < (LOOP >>> 6 || 1); ++z) {
    const d = sign(rng.array(a), rng.array(b));
    const e = generate(a);
    assert(verify(e, b, d), "verify correct signature");
    ++e[0], assert(!verify(e, b, d), "don't change public key");
    --e[0], ++b[0], assert(!verify(e, b, d), "don't change message");
    --b[0], ++d[0], assert(!verify(e, b, d), "don't change signature");
  }
  const d = generate(rng.array(a));
  const e = sign(a, rng.array(b));
  assert(!verify(d, b, new Uint8Array(e).fill(-1, 0, 32)), "bad point");
  assert(!verify(d, b, new Uint8Array(e).fill(-1, 32)), "too big");
  assert(
    !verify(s16_a(BigInt("1" + "0".repeat(73)).toString(16)).reverse(), b, e),
    "bad public key",
  );
  assert(
    !verify(s16_a((1n | 1n << 255n).toString(16)).reverse(), b, e),
    "another bad point",
  );
});
Deno.test("rfc 8032", async () => {
  const a = await read("rfc8032.txt");
  const b = a.slice(
    a.indexOf("Test Vectors for Ed25519\n"),
    a.indexOf("Test Vectors for Ed25519ctx\n"),
  ).replace(/Josefsson & Liusvaara[\s -~]+?January 2017/g, "");
  for (const c of ["1", "2", "3", "1024", "SHA(abc)"]) {
    const d = RegExp(
      `-----TEST ${
        c.replace(/[()]/g, "\\$&")
      }\\s+ALGORITHM:\\s+Ed25519\\s+SECRET KEY:([\\s\\da-f]+)PUBLIC KEY:([\\s\\da-f]+)MESSAGE \\(length \\d+ bytes?\\):([\\s\\da-f]+)SIGNATURE:([\\s\\da-f]+)`,
      "s",
    ).exec(b)!.slice(1).map((Z) => s16_a(Z.replace(/\s/g, "")));
    const e = d[0], f = d[1], g = d[2], h = d[3];
    assertEquals(generate(e), f, `test ${c} generate`);
    assertEquals(sign(e, g), h, `test ${c} sign`);
    assert(verify(f, g, h), `test ${c} verify`);
  }
});
test(exchange, () => {
  const a = new Uint8Array(32);
  const b = new Uint8Array(32);
  for (let z = 0; z < (LOOP >>> 5 || 1); ++z) {
    const c = generate(crypto.getRandomValues(a));
    const d = generate(crypto.getRandomValues(b));
    assertEquals(exchange(a, d), exchange(b, c), "same");
  }
});
