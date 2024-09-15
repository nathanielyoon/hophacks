import { base58 } from "./lib/58.ts";
import { add } from "./lib/dom.ts";

const key = location.pathname.slice(1);
if (base58.test(key) && key.length === 45) import("./main_page.ts");
else if (key) add("h1").textContent = `${key} IS NOT Ok`;
else import("./index_page.ts");
