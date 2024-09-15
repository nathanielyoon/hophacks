import { a_s58, base58 } from "../lib/58.ts";
import { $, add } from "../lib/dom.ts";
import { current } from "../lib/geolocation.ts";
import { Xata } from "../lib/xata.ts";

$("button").addEventListener("click", async function (this) {
  this.disabled = true;
  const key = a_s58(crypto.getRandomValues(new Uint8Array(32)));
  console.log(key);
  const response = await fetch("/spots", {
    method: "POST",
    body: `{"key":"${key}"}`,
  });
  console.log(response, await response.text());
  if (response.status === 201) {
    console.log(":)");
    this.replaceWith(add("a", null, {
      href: `https://hophacks.nyoon.io/${key}`,
      textContent: `hophacks.nyoon.io/${key}`,
    }));
  } else {
    console.log(":(");
    this.replaceWith(
      add("output", null, { textContent: await response.text() }),
    );
  }
}, { once: true, passive: true });
$("form").addEventListener("submit", function (this, event) {
  event.preventDefault();
  const key_or_url = $("input", this);
  const submit = $<"input">("input[type=submit]", this);
  key_or_url.setCustomValidity("");
  key_or_url.disabled = submit.disabled = true;
  const key = key_or_url.value.slice(-45);
  key.length === 45 && base58.test(key)
    ? location.href = `https://hophacks.nyoon.io/${key}`
    : (key_or_url.disabled = submit.disabled = false,
      key_or_url.setCustomValidity("WRONG!"));
}, { once: true });
