import { $ } from "../lib/dom.ts";
import { current } from "../lib/geolocation.ts";
import { Xata } from "../lib/xata.ts";

const output = $("output");
$("form").addEventListener("submit", function (this, event) {
  event.preventDefault();
  const alt = +(new FormData(this).get("alt") ?? "");
  this.remove();
  event.submitter instanceof HTMLInputElement &&
    current(alt, !!event.submitter.value)
      .then((state) =>
        fetch("/state", { method: "POST", body: JSON.stringify(state) })
      ).then((response) => {
        switch (response.status) {
          case 201:
            output.textContent = "ok";
            break;
          default:
            return response.text().then((text) => output.textContent = text);
        }
      });
});
