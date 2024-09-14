import { assertEquals, assertLessOrEqual } from "jsr:@std/assert@^1.0.0";
import { Blossom, blossom, Edges, hungarian } from "../lib/matching.ts";
import { LONG, read, RNG, test } from "./test.ts";
import { BASE } from "./test.ts";

test(hungarian, () => {
  assertEquals(hungarian([]), new Float64Array(), "nothing");
  assertEquals(hungarian([[]]), new Float64Array(), "still nothing");
  assertEquals(
    new Float64Array(hungarian([[8, 5, 9], [4, 2, 4], [7, 3, 8]]).buffer),
    new Float64Array([0, 2, 1, 15]),
    "wikipedia example",
  );
});
const edges = (rng: RNG, count: number) => {
  const a = new Int32Array(count);
  const b = new Int32Array(count);
  const c = Array<Float64Array>(count);
  const d: Edges = [];
  for (let z = 0; z < count; ++z) c[z] = new Float64Array(count);
  for (let z = 0; z < count; ++z) {
    rng.array(a), rng.array(b);
    for (let y = z + 1; y < count; ++y) d.push([z, y, 1e15 * a[y] / b[y]]);
  }
  return [c, d] satisfies [Float64Array[], Edges];
};
const A = await read("mwmatching.py");
const B = `import sys
import json


DEBUG = None
CHECK_DELTA = False
CHECK_OPTIMUM = False


${A.slice(1189, -5258)}
if __name__ == "__main__":
    with open(f"{sys.argv[0][:-13]}test/edges.json", "r") as file:
        edges = json.load(file)
    matching = maxWeightMatching(edges, True)
    print(json.dumps(matching, separators=(',', ':')))`;
const python = async (rng: RNG, vertices: number) => {
  const [a, b] = edges(new RNG(rng.seed), vertices);
  await Deno.writeTextFile(`${BASE}/src/test/edges.json`, JSON.stringify(b));
  const c = new Blossom(b, true).match();
  const d = new Int32Array(JSON.parse(new TextDecoder().decode(
    (await new Deno.Command("python3", { args: ["-c", B] }).output()).stdout,
  )));
  try {
    assertEquals(c, d, "same as python reference");
  } catch {
    let e = 0, f = 0;
    for (let z = 0; z < c.length; ++z) if (~c[z]) e += a[z][c[z]];
    for (let z = 0; z < d.length; ++z) if (~d[z]) f += a[z][d[z]];
    assertLessOrEqual(e, f, "or better?");
  }
};
test("mwmatching", () => {
  const a = [...A.matchAll(/Matching\(\[(.*?)\](?:, (\w+))?\), \[(.*?)\]/g)];
  for (let z = 0; z < a.length; ++z) {
    const b = a[z];
    assertEquals(
      new Blossom(
        Array.from(
          b[1].replace("math.pi", `${Math.PI}`)
            .replace("math.exp(1)", `${Math.exp(1)}`)
            .replace("math.sqrt(2.0)", `${Math.sqrt(2)}`)
            .matchAll(/\(([-\w.]+),([-\w.]+),([-\w.]+)\)/g),
          (Z) => [+Z[1], +Z[2], +Z[3]],
        ),
        b[2] === "True",
      ).match(),
      Int32Array.from(b[3].match(/[-\w]+/g) ?? [], Number),
      "source unit tests",
    );
  }
});
test(blossom, () => {
  assertEquals(blossom([]), [[], undefined], "nothing");
  assertEquals(blossom([[0, 1, 2]]), [[[0, 1]], undefined], "woohoo");
});
if (LONG.match(/\bblossom\b/i)) {
  for (let z = 0; z < 0xa0; ++z) test(`lil ${z}`, (rng) => python(rng, z));
  for (let z = 0x80; z < 0x401; ++z) {
    test(`big ${z}`, async (rng) => await python(rng, z));
  }
}
