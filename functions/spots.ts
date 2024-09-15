import { UnreachableError } from "../src/lib/error.ts";
import { parse } from "../src/lib/form.ts";
import { safe } from "../src/lib/input.ts";
import { Context, error, GET, PUT, SPOT, Spot } from "../src/lib/xata.ts";
import { detoken } from "../src/lib/jwt.ts";
import { verify } from "../src/lib/25519.ts";
import { s58_a } from "../src/lib/58.ts";

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
export const onRequestPut = (context: Context) => {
  try {
    const token = detoken(context.request.headers.get("authorization") ?? "");
    return context.request.text()
      .then((text) => {
        const ok = verify(
          s58_a(text.slice(0, 45)),
          new TextEncoder().encode(text.slice(45, -90)),
          s58_a(text.slice(-90)),
        );
        if (ok) {
          return PUT(context.env, text.slice(0, 45), spot(text.slice(45)));
        } else return new Response(null, { status: 403 });
      })
      .catch(error);
  } catch {
    return new Response(null, { status: 403 });
  }
};
