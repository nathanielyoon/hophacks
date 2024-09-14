import { $ } from "../lib/dom.ts";
import { current } from "../lib/geolocation.ts";
import { Xata } from "../lib/xata.ts";
import env from "../../env.json" with { type: "json" };

const a = new Xata(env.XATA_API_KEY, env.XATA_STATE_URL);
$("form").addEventListener("submit", function (this, event) {
  event.preventDefault();
  if (event.submitter instanceof HTMLInputElement) {
    current(+(new FormData(this).get("alt") ?? ""), !!event.submitter.value)
      .then((Z) => a.post("INSERT", Z));
  }
});
