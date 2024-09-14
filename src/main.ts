import { $ } from "./lib/dom.ts";

const a = $("code");
const b = $("div");
const c = $("button");
const d: { [_: string]: number }[] = [];

c.addEventListener(
  "click",
  () => {
    b.textContent = "wait";
    navigator.geolocation.getCurrentPosition(({ coords, timestamp }) => {
      d.push({
        timestamp,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      a.textContent = JSON.stringify(d, null, 2);
      b.textContent = "ok";
    });
  },
);
