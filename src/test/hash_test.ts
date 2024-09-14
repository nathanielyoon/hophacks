import { assertEquals } from "jsr:@std/assert@^1.0.0";
import {
  hkdf,
  hmac,
  next,
  oaat,
  seed_key,
  sha256,
  sha512,
} from "../lib/hash.ts";
import { BASE, cs, LOOP, read, RNG, test } from "./test.ts";

const a = Array<Uint8Array[]>(257);
const b = Array<Uint8Array[]>(129);
{
  const c = await Promise.all([
    read("SHA512ShortMsg.rsp"),
    read("SHA512LongMsg.rsp"),
    read("SHA256ShortMsg.rsp"),
    read("SHA256LongMsg.rsp"),
  ]);
  const d = /Len = (\d+)\s+Msg = (\S+)\s+MD = (\S+)/g;
  const e = [...(c[0] + c[1]).matchAll(d)], f = [...(c[2] + c[3]).matchAll(d)];
  const i = (match: string[]) =>
    [match[2].slice(0, +match[1] << 1), match[3]].map((Z) =>
      Uint8Array.from(Z.match(/../g) ?? [], (Y) => parseInt(Y, 16))
    );
  for (let z = 0; z < a.length; ++z) {
    a[z] = i(e[z]), z < b.length && (b[z] = i(f[z]));
  }
}
test("NIST FIPS 180-4", () => {
  for (let z = 0; z < a.length; ++z) {
    assertEquals(sha512(a[z][0]), a[z][1]);
    z < b.length && assertEquals(sha256(b[z][0]), b[z][1]);
  }
});
test(hmac, async (rng) => {
  const d = [new Uint8Array(32), new Uint8Array(128)];
  const e = new Uint8Array(LOOP);
  for (let z = 0; z < (LOOP >>> 1 || 1); ++z) {
    const f = rng.array(e.subarray(z));
    const g = await Promise.all(d.map((Z) =>
      cs.importKey(
        "raw",
        rng.array(Z),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      ).then((Y) => cs.sign("HMAC", Y, f)).then((Y) => new Uint8Array(Y))
    ));
    assertEquals(hmac(d[0], f), g[0], "short key");
    assertEquals(hmac(d[1], f), g[1], "long key");
  }
});
test(hkdf.name, async (rng) => {
  const d = new Uint8Array(32);
  for (let z = 0; z < (LOOP >>> 1 || 1); ++z) {
    const e = hkdf(rng.array(d));
    const f = await cs.importKey("raw", d, "HKDF", false, ["deriveBits"]);
    assertEquals(
      e(rng.array(d)),
      await cs.deriveBits(
        { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: d },
        f,
        256,
      ).then((Z) => new Uint8Array(Z)),
    );
  }
});
const TIMESTWO = (from: Uint32Array, to: Uint32Array) => {
  to[0] = (from[0] << 1) ^ [0x00, 0x87][from[3] >>> 31];
  to[1] = (from[1] << 1) | (from[0] >>> 31);
  to[2] = (from[2] << 1) | (from[1] >>> 31);
  to[3] = (from[3] << 1) | (from[2] >>> 31);
};
test(seed_key, async () => {
  const d = await read("chaskey.cpp");
  const e = new Uint32Array(4);
  const f = new Uint32Array(4);
  const g = new Uint32Array(12);
  for (const h of [seed_key(0, 0), seed_key(0, 0, g)]) {
    assertEquals(
      h.subarray(0, 4),
      Uint32Array.from(
        d.slice(
          d.indexOf("reference KAT vectors below, which is:\n"),
          d.indexOf("that test vector key."),
        ).match(/0x[\da-f]{8}/g)!,
        (Z) => parseInt(Z, 16),
      ),
      "test vector key",
    );
    TIMESTWO(h, e);
    assertEquals(h.subarray(4, 8), e, "round 1");
    TIMESTWO(e, f);
    assertEquals(h.subarray(8), f, "round 2");
  }
});
test(oaat, async (rng) => {
  const d = BASE + "/src/test/oaat";
  try {
    await Deno.stat(d);
  } catch (c) {
    if (!(c instanceof Deno.errors.NotFound)) throw c;
    await new Deno.Command("g++", { args: [`${d}.cpp`, "-o", d] }).output();
  }
  const e = new Deno.Command(d, { stdin: "piped", stdout: "piped" });
  const f = rng.string(RNG.ascii);
  const g = LOOP >>> 5 || 1;
  const h = Array<Promise<void>>(g);
  for (let z = 0; z < g; ++z) {
    const i = new TextEncoder().encode(f());
    const j = e.spawn();
    const k = j.stdin.getWriter();
    h[z] = k.write(i)
      .then(() => k.ready)
      .then(() => k.close())
      .then(() => j.output())
      .then((Z) =>
        assertEquals(
          oaat(i, 0),
          +new TextDecoder().decode(Z.stdout),
          "ascii oaat",
        )
      );
  }
  await Promise.all(h);
});
test(next, (rng) => {
  const a = rng.array(new Uint32Array(LOOP));
  const b = new Set<number>();
  for (let z = 0; z < LOOP; ++z) b.add(~a[z]).add(next(~a[z]));
  assertEquals(b.size, LOOP << 1, "no overlap");
});
