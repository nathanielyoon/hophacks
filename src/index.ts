import { a_s58, base58 } from "./lib/58.ts";
import { add } from "./lib/dom.ts";

const yell = (message: string) => add("h1").textContent = message;
const url = new URL(location.href);
const key = url.pathname.slice(1);
if (base58.test(key) && key.length === 45) {
  const response = await fetch(`https://spots.nyoon.io/${key}`, {
    mode: "cors",
  });
  add("output").textContent = await response.text();
  const text = await response.text();
} else if (key) yell(`${key} IS NOT A VALID KEY`);
else {
  add("button", undefined, { textContent: "get STARTEd" }).addEventListener(
    "click",
    function (this) {
      this.disabled = true;
      const key = a_s58(crypto.getRandomValues(new Uint8Array(32)));
      fetch("/spots", { method: "PUT", body: key + "[]" })
        .then((response) =>
          response.text().then((text) => {
            const url = `hophacks.nyoon.io/${key}`;
            if (response.ok) {
              this.replaceWith(
                add("a", null, { href: "https://" + url, textContent: url }),
              );
            } else {
              this.replaceWith(add("output", null, {
                textContent: text,
              }));
            }
          })
        );
    },
    { once: true, passive: true },
  );
}
