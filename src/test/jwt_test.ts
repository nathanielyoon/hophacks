import {
  assertEquals,
  assertInstanceOf,
  assertMatch,
  assertThrows,
} from "jsr:@std/assert@^1.0.0";
import { generate } from "../lib/25519.ts";
import { a_s58 } from "../lib/58.ts";
import { Data, FormError, parse } from "../lib/form.ts";
import { InputError } from "../lib/input.ts";
import { detoken, entoken, payload } from "../lib/jwt.ts";
import { LOOP, RNG, test } from "./test.ts";

test("payload", () => {
  const a = { iss: "", sub: "", ctx: ".".repeat(0x10001), exp: "-1" };
  try {
    parse(payload, a);
  } catch (Z) {
    assertInstanceOf(Z, FormError<typeof payload>, "fails");
    assertEquals(Z.cause, [payload, {
      iss: new InputError(payload.iss, "pattern", a.iss),
      sub: new InputError(payload.sub, "pattern", a.sub),
      ctx: new InputError(payload.ctx, "maxlength", a.ctx),
      exp: new InputError(payload.exp, "min", a.exp),
    }], "everything fails");
  }
  a.iss = "A".repeat(45), a.sub = "B".repeat(45), a.ctx = "", a.exp = "0";
  assertEquals(parse(payload, a), { ...a, exp: +a.exp }, "ok");
});
test(entoken, (rng) => {
  const a = new Uint8Array(32);
  const b = rng.string(RNG.unicode);
  for (let z = 0; z < (LOOP >>> 5 || 1); ++z) {
    assertMatch(
      entoken(rng.array(a), {
        iss: a_s58(a),
        sub: a_s58(rng.array(a)),
        ctx: b(z),
        exp: rng.number(),
      }),
      /^[-\w]{20}\.[-\w]+\.[-\w]{86}$/,
    );
  }
});
test(detoken, (rng) => {
  assertThrows(() => detoken(""), "empty = 400");
  assertThrows(() => detoken(":)"), "invalid header = 400");
  assertThrows(() => detoken("Bearer :)"), "invalid token = 401");
  const a = rng.string(RNG.unicode);
  for (let z = 0; z < (LOOP >> 2 || 1); ++z) {
    assertThrows(() => detoken(a(z)), "all fail");
  }
  const b = new Uint8Array(32), c = new Uint8Array(32);
  const d = {
    iss: a_s58(generate(rng.array(b))),
    sub: a_s58(rng.array(c)),
    ctx: a(),
    exp: Date.now() / 1000 >>> 0,
  };
  const e = (jwt: Partial<Data<typeof payload>>) =>
    detoken(`Bearer ${entoken(b, { ...d, ...jwt })}`);
  assertEquals(e({}), d, "those are fine");
  assertThrows(() => e({ iss: d.sub }), "different key");
  assertThrows(() => e({ sub: d.sub.slice(1) }), "invalid key");
  assertThrows(() => e({ ctx: ".".repeat(0x10001) }), "too long");
  assertThrows(() => e({ exp: d.exp - 1000 }), "too late");
});
