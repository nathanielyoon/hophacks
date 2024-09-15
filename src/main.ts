import { build } from "./lib/build.ts";

document.body.appendChild(
  new DOMParser().parseFromString(
    build(
      "A".repeat(45),
      [
        [
          { label: "malone chair", lat: 1.2, lon: 3.4, alt: 5, range: 2 },
          [],
        ],
      ],
    ),
    "text/html",
  ).body,
);

addEventListener("load", () => import("./script.ts"));
