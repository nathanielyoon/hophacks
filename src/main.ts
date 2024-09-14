import { add } from "./dom.ts";

add("h1").textContent = "low accuracy";
const a = add("code");
a.style.cssText = "font-family: monospace monospace; white-space: pre";
navigator.geolocation.watchPosition(
  (Z) => a.textContent = JSON.stringify(Z.coords, null, 2),
  null,
);
add("h1").textContent = "high accuracy";
const b = add("code");
b.style.cssText = "font-family: monospace monospace; white-space: pre";
navigator.geolocation.watchPosition(
  (Z) => b.textContent = JSON.stringify(Z.coords, null, 2),
  null,
  { enableHighAccuracy: true },
);
