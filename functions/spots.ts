import { on } from "../src/functions.ts";
import { base58 } from "../src/lib/58.ts";
import { compile } from "../src/lib/compile.ts";
import { presign } from "../src/lib/s3.ts";

export const onRequestPost = on({
  key: { type: "text", minlength: 45, maxlength: 45, pattern: base58 },
}, async (env, body) => { // generate a new presigned url and add it directly to the page
  console.log(env);
  console.log(body);
  const key = body.key;
  const url = presign(env, key);
  console.log(url);
  const page = compile(key, [{
    label: "label",
    lat: 0,
    lon: 0,
    alt: 0,
    range: 5,
  }]);
  console.log(page);
  const response = await fetch(url, {
    method: "PUT",
    body: page,
    headers: { "cache-control": "no-cache", "content-type": "text/html" },
  });
  console.log(response, await response.text());
  return new Response(response.ok ? ":)" : ":(");
});
