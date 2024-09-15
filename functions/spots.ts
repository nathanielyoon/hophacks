import { UnreachableError } from "../src/lib/error.ts";
import { parse } from "../src/lib/form.ts";
import { safe } from "../src/lib/input.ts";
import { Context, error, GET, PUT, SPOT, Spot } from "../src/lib/xata.ts";

const spot = (text: string) => {
  const json = safe(text);
  if (!Array.isArray(json)) throw new UnreachableError({ text });
  const spots = Array<Spot>(json.length);
  for (let z = 0; z < json.length; ++z) spots[z] = parse(SPOT, json[z]);
  return spots;
};
export const onRequestPost = (context: Context) =>
  context.request.text()
    .then((text) => GET(context.env, spot(text)))
    .catch(error);
export const onRequestPut = (context: Context) =>
  context.request.text()
    .then((text) =>
      new Response(JSON.stringify({
        key: text.slice(0, 45),
        json: text.slice(45),
      }))
    );
// .then((text) => PUT(context.env, text.slice(0, 45), spot(text.slice(45))))
// .catch(error);
