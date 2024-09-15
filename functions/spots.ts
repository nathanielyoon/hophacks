import { on } from "../src/functions.ts";
import { base58 } from "../src/lib/58.ts";
import { compile } from "../src/lib/compile.ts";
import { presign } from "../src/lib/s3.ts";

export const onRequestPost = on({
  key: { type: "text", minlength: 45, maxlength: 45, pattern: base58 },
}, async (env, body) => { // generate a new presigned url and add it directly to the page
  const key = body.key;
  const url = presign(env, key);
  const response = await fetch(url, {
    method: "PUT",
    body: compile(key, [{ label: "label", lat: 0, lon: 0, alt: 0, range: 5 }]),
    headers: { "cache-control": "no-cache", "content-type": "text/plain" },
  });
  return new Response(response.ok ? ":)" : ":(");
});
