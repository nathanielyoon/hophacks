import { $ } from "./lib/dom.ts";

const a = $("code");
const b = $("button");

b.addEventListener(
  "click",
  () =>
    navigator.geolocation.getCurrentPosition((position) =>
      a.textContent = JSON.stringify(position, null, 2)
    ),
);
