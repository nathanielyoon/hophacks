import { assertEquals, assertThrows } from "jsr:@std/assert@^1.0.0";
import {
  BOOLEAN,
  checkbox,
  EMAIL,
  Input,
  InputError,
  Json,
  JSONError,
  radio,
  safe,
  Value,
} from "../lib/input.ts";
import { fcc, RNG, test } from "./test.ts";
import { next } from "../lib/hash.ts";
import { LOOP } from "./test.ts";
import { stringify } from "../lib/form.ts";
import { boolean } from "../lib/input.ts";

const A: ((seed: number, max: number) => Json)[] = [
  () => null,
  (seed) => !(seed & 1),
  (seed) => seed,
  (seed) => seed / next(seed),
  (seed) => seed.toString(),
  (seed) => seed.toString(16).padStart(8, "0"),
  ...[RNG.alpha, RNG.ascii, RNG.unicode].map((Z) => (seed: number) =>
    Array.from(
      { length: seed & 127 },
      (_, Y) => fcc(Z(next(seed >>> Y))),
    ).join("")
  ),
  (seed, max) =>
    Array.from(
      { length: max++ - 3 && seed & 7 },
      (_, Z) => A[next(seed >>> Z) % A.length](next(seed >>> Z), max),
    ),
  (seed, max) =>
    Array.from(
      { length: max++ - 3 && seed & 7 },
      (_, Z) => next(seed >>> Z),
    ).reduce((Z, Y) => ({ ...Z, [Y]: A[Y % A.length](Y, max) }), {}),
];
const json = (rng: RNG) => () => A[rng.number() % A.length](rng.number(), 0);
test("BOOLEAN", () => {
  const a = ["0", "1", "no", "yes", "false", "true"];
  for (let z = 0; z < a.length; ++z) {
    const b = a[z];
    for (const c of [/(?:)/, /[a-n]/g, /[a-z]/g]) {
      const d = b.replace(c, (Z) => Z.toUpperCase());
      assertEquals(BOOLEAN.exec(d)?.[(z & 1) + 1], d, "true or false");
    }
  }
});
test("EMAIL", () => {
  const a =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  for (
    const b of [
      "simple@example.com",
      "very.common@example.com",
      "FirstName.LastName@EasierReading.org",
      "x@example.com",
      "long.email-address-with-hyphens@and.subdomains.example.com",
      "user.name+tag+sorting@example.com",
      "name/surname@example.com",
      "admin@example",
      "example@s.example",
      '" "@example.org',
      '"john..doe"@example.org',
      "mailhost!username@example.org",
      '"very.(),:;<>[]".VERY."very@\\\\ "very".unusual"@strange.example.com',
      "user%example.com@example.org",
      "user-@example.org",
      "postmaster@[123.123.123.123]",
      "postmaster@[IPv6:2001:0db8:85a3:0000:0000:8a2e:0370:7334]",
      "_test@[IPv6:2001:0db8:85a3:0000:0000:8a2e:0370:7334]",
      "abc.example.com",
      "a@b@c@example.com",
      'a"b(c)d,e:f;g<h>i[j\\k]l@example.com',
      'just"not"right@example.com',
      'this is"not\\allowed@example.com',
      'this\\ still"not\\\\allowed@example.com',
      "1234567890123456789012345678901234567890123456789012345678901234+x@example.com",
      "i.like.underscores@but_they_are_not_allowed_in_this_part",
    ]
  ) assertEquals(EMAIL.test(b), a.test(b), "same as html");
});
test(safe, (rng) => {
  const a = json(rng);
  for (let z = 0; z < LOOP; ++z) {
    const b = a(), c = JSON.stringify(b);
    const d = c.replace(
      /[ -~]/g,
      (Z) => fcc(Z.charCodeAt(0) + 1),
    );
    assertEquals(safe(c), b, "parses ok");
    try {
      JSON.parse(d);
    } catch {
      assertThrows(() => safe(d), "throws ok");
    }
  }
});
type Test<A extends Input["type"]> = readonly [
  Partial<Input & { type: A }>,
  readonly [Value<Input & { type: A }>, string?] | null,
  readonly string[],
];
const input = <A extends Input["type"], B extends Input & { type: A }>(
  parser: { [C in A]: (input: B, value: string) => Value<B> },
  properties: {
    [C in keyof B]?: (seed: number) => Test<A>[];
  },
  repeat = LOOP,
) =>
  test("input " + Object.keys(parser)[0], (rng) => {
    const b = parser[<A> Object.keys(parser)[0]];
    const c = <(string & keyof B)[]> Object.keys(properties);
    const d = c.length * repeat;
    for (let z = 0; z < d; ++z) {
      const e = c[z % c.length], f = properties[e];
      if (!f) continue;
      const g = f(rng.number());
      for (let y = 0; y < g.length; ++y) {
        const [h, i, j] = g[y], k = <B> h;
        if (i) {
          assertEquals(
            b(k, i[1] ?? (typeof i[0] === "string" ? i[0] : stringify(i[0]))),
            i[0],
            "ok",
          );
        }
        for (let x = 0; x < j.length; ++x) {
          try {
            b(k, j[x]);
          } catch (Z) {
            if (Z instanceof JSONError) assertEquals(Z.cause[0], j[x], "is ok");
            else if (Z instanceof InputError) {
              assertEquals(Z.cause[0], k, "right input");
              assertEquals(Z.cause[1], e, "right key");
            } else throw Z;
          }
        }
      }
    }
  });

input({ boolean }, {
  type: () => [
    ...["1", "0", "true", "false", "yes", "no"].map(
      (Z, Y) => [{}, [!(Y & 1), Z], [Z.repeat(2)]] as const,
    ),
    [{}, null, [""]],
  ],
});
input({ radio }, {
  options: (Z) =>
    [...new Set(Z.toString(36))].map(
      (Z, _, Y) => [{ options: [Y[0], ...Y.slice(1)] }, [Z], [Z + Z]],
    ),
});
input({ checkbox }, {
  type: (Z) => [[
    { options: [`${Z}`[0], ...`${Z}`.slice(1)] },
    [new Set([`${Z}`[0]])],
    ["", "0", "{}"],
  ]],
  options: (Z) => [[
    {
      options: [
        fcc(Z),
        ...Array.from({ length: (Z & 7) + 1 }, (_, Y) => fcc(Z + Y)),
      ],
    },
    [new Set(Z & 1 ? [fcc(Z), fcc(Z + 1)] : [fcc(Z)])],
    Array.from({ length: Z & 7 }, (_, Y) => fcc(Z - Y - 1)),
  ]],
});
