import { on } from "../src/functions.ts";
import { base58 } from "../src/lib/58.ts";
import { presign } from "../src/lib/s3.ts";

export const onRequestPost = on({
  key: { type: "text", minlength: 45, maxlength: 45, pattern: base58 },
}, async (env, body) => { // generate a new presigned url and add it directly to the page
  console.log(body);
  const key = body.key;
  const url = presign(env, key);
  console.log(url);
  const response = await fetch(url, {
    method: "PUT",
    body: "here it is!",
    headers: { "cache-control": "no-cache", "content-type": "text/plain" },
  });
  console.log(response, await response.text());
  return new Response(response.ok ? ":)" : ":(");
});
