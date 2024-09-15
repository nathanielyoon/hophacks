import { generate } from "./lib/25519.ts";
import { a_s58, base58, s58_a } from "./lib/58.ts";
import { $, $$, add } from "./lib/dom.ts";
import { locate } from "./lib/geolocation.ts";
import { Spot } from "./lib/xata.ts";

// change all input[type=submit] to button for consistency
const yell = (message: string) => add("h1").textContent = message;
const url = new URL(location.href);
const key = url.pathname.slice(1);
const row = (tbody: HTMLTableSectionElement, spot: Spot, count: number) => {
  const tr = add("tr", tbody);
  add("td", tr).textContent = spot.label;
  add("td", tr).textContent = `${count}`;
};
if (base58.test(key) && key.length === 45) {
  const secret_key = s58_a(key);
  const public_key = a_s58(generate(secret_key));
  const spots = [{
    label: "MY SPOT",
    lat: 23.12823471289412,
    lon: 46.20350891832094,
    alt: 3,
  }, {
    label: "malone chair",
    lat: -88.01982783901830,
    lon: 50.10928901284092,
    alt: 3,
  }];
  const states = [1, 2];
  const table = add("table");
  const thead = add("thead", table);
  add("th", thead).textContent = "?", add("th", thead).textContent = "#";
  const tbody = add("tbody", table);
  for (let z = 0; z < spots.length; ++z) row(tbody, spots[z], states[z]);
  const new_form = add("form");
  const label_field = add(
    "input",
    add("label", new_form, { textContent: "Label" }),
    {
      name: "label",
      pattern: "^[ -~]{1,4095}$",
      required: true,
    },
  );
  const alt_field = add(
    "input",
    add("label", new_form, { textContent: "Altitude" }),
    {
      name: "alt",
      type: "number",
      min: "-128",
      max: "127",
      required: true,
    },
  );
  const submit = add("input", new_form, { type: "submit", value: "Add" });
  new_form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit.disabled = true;
    const label = label_field.value;
    locate(public_key, alt_field.valueAsNumber).then((state) => {
      const spot = { label, lat: state.lat, lon: state.lon, alt: state.alt };
      spots.push(spot);
      states.push(1);
      row(tbody, { label, lat: state.lat, lon: state.lon, alt: state.alt }, 1);
      fetch("/state", {
        method: "PUT",
        body: public_key + JSON.stringify(spots),
      }).then(() => submit.disabled = false);
    });
  });
  let editing = false;
  add("button", undefined, { textContent: "Edit" }).addEventListener(
    "click",
    function (this) {
      const rows = $$<"tr">("tbody tr");
      if (editing = !editing) {
        for (let z = 0; z < rows.length; ++z) {
          const cell = rows[z].cells[0];
          cell.firstChild?.replaceWith(add("input", null, {
            value: cell.textContent ?? "",
          }));
        }
        this.textContent = "Save";
      } else {
        for (let z = 0; z < rows.length; ++z) {
          const cell = rows[z].cells[0];
          spots[z].label = cell.textContent = $("input").value;
        }
        fetch("/state", {
          method: "PUT",
          body: public_key + JSON.stringify(spots.filter((spot) => spot.label)),
        });
        this.textContent = "Edit";
      }
    },
    { passive: true },
  );
  const check_in = add("form");
  const alt_input = add(
    "input",
    add("label", check_in, { textContent: "altitude" }),
    {
      name: "alt",
      type: "number",
      min: "-128",
      max: "127",
      required: true,
    },
  );
  const submitter = add("input", check_in, {
    type: "submit",
    value: "Check in :)",
  });
  check_in.addEventListener("submit", (event) => {
    event.preventDefault();
    submitter.disabled = true;
    locate(public_key, alt_input.valueAsNumber).then((state) =>
      fetch("/state", {
        method: "POST",
        body: JSON.stringify(state),
      })
    );
  });
  add("button", undefined, { textContent: "Check out :(" }).addEventListener(
    "click",
    () =>
      fetch("/state", {
        method: "DELETE",
        body: JSON.stringify({ key: public_key }),
      }).then(() => submitter.disabled = false),
    { passive: true },
  );
} else if (key) yell(`${key} IS NOT A VALID KEY`);
else {
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
