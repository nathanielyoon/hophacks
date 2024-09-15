import { a_s58 } from "./lib/58.ts";
import { add } from "./lib/dom.ts";

add("button", undefined, { textContent: "GET STARTED" }).addEventListener(
  "click",
  async function (this) {
    this.disabled = true;
    const key = a_s58(crypto.getRandomValues(new Uint8Array(32)));
    const response = await fetch("/spots", { method: "PUT", body: key + "[]" });
    const text = await response.text();
    const url = `hophacks.nyoon.io/${key}`;
    if (response.ok) {
      this.replaceWith(
        add("a", null, { href: "https://" + url, textContent: url }),
      );
    } else {
      this.replaceWith(add("output", null, { textContent: text }));
    }
  },
);
