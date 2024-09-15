import { UnreachableError } from "../src/lib/error.ts";
import { parse } from "../src/lib/form.ts";
import { safe } from "../src/lib/input.ts";
import { GET } from "../src/lib/xata2.ts";
import { Context, error, SPOT, Spot } from "../src/lib/xata2.ts";

export const onRequestPost = (context: Context) =>
  context.request.text().then((text) => {
    const json = safe(text);
    if (!Array.isArray(json)) {
      throw new UnreachableError({ message: "COME ON", text });
    }
    const spots = Array<Spot>(json.length);
    for (let z = 0; z < json.length; ++z) spots[z] = parse(SPOT, json[z]);
    return GET(context.env, spots);
  }).catch(error);
