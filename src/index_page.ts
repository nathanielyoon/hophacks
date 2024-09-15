import { generate, sign } from "./lib/25519.ts";
import { a_s58 } from "./lib/58.ts";
import { add } from "./lib/dom.ts";

add("button", undefined, { textContent: "GET STARTED" }).addEventListener(
  "click",
  async function (this) {
    this.disabled = true;
    const secret_key = crypto.getRandomValues(new Uint8Array(32));
    const public_key = a_s58(generate(secret_key));
    const signature = a_s58(sign(secret_key, new TextEncoder().encode("[]")));
    const response = await fetch("/spots", {
      method: "PUT",
      body: public_key + "[]" + signature,
    });
    const text = await response.text();
    const url = `hophacks.nyoon.io/${a_s58(secret_key)}`;
    if (response.ok) {
      this.replaceWith(
        add("a", null, { href: "https://" + url, textContent: url }),
      );
    } else {
      this.replaceWith(add("output", null, { textContent: text }));
    }
  },
);
