import { $ } from "./lib/dom.ts";
import { current } from "./lib/geolocation.ts";

const a = $("code");
const b = $("div");
const c = $("button");

c.addEventListener(
  "click",
  () => {
    b.textContent = "wait";
    current().then((Z) => {
      a.textContent = JSON.stringify(
        { timestamp: Z[0], latitude: Z[1], longitude: Z[2] },
        null,
        2,
      );
      b.textContent = "ok";
    });
  },
);
