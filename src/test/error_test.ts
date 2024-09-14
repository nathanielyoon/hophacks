import { assertEquals, assertInstanceOf } from "jsr:@std/assert@^1.0.0";
import { Errer } from "../lib/error.ts";
import { LOOP, RNG, test } from "./test.ts";

class Failer extends Errer<string> {}
test(Errer, (rng) => {
  const a = rng.string(RNG.unicode);
  for (let z = 0; z < LOOP; ++z) {
    const b = a(), c = a(), d = new Failer(b, c);
    assertInstanceOf(d, Failer, "for type information");
    assertEquals({ ...d.toJSON(), stack: 0 }, {
      name: Failer.name,
      message: b,
      cause: c,
      stack: 0,
    }, "everything's there");
  }
});
