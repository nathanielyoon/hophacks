import { a_s58, base58 } from "./lib/58.ts";
import { add } from "./lib/dom.ts";

const url = new URL(location.href);
const key = url.pathname.slice(1);
if (base58.test(key) && key.length === 45) {
  console.log("OKN");
} else if (key) {
  console.log(":(((");
  add("h1").textContent = `${key} IS NOT A VALID KEY`;
} else {
  console.log("OK HERe");
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
