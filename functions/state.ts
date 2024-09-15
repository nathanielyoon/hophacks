import { on } from "../src/functions.ts";
import { STATE, Xata } from "../src/lib/xata.ts";

export const onRequestPost = on(STATE, async (env, body) => {
  await new Xata(env.XATA_API_KEY, env.XATA_STATE_URL).post(body);
  return new Response(null, { status: 201 });
});
