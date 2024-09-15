import { generate } from "./lib/25519.ts";
import { a_s58, s58_a } from "./lib/58.ts";
import { add } from "./lib/dom.ts";
import { locate } from "./lib/geolocation.ts";
import { Spot } from "./lib/xata.ts";

const secret_key = s58_a(location.pathname.slice(1));
const public_key = a_s58(generate(secret_key));
const row = (tbody: HTMLTableSectionElement, spot: Spot, count: number) => {
  const tr = add("tr", tbody);
  add("td", tr).textContent = spot.label;
  add("td", tr).textContent = `${count}`;
};
const table = (spots: Spot[], states: number[]) => {
  const table = add("table");
  const thead = add("thead", table);
  add("th", thead).textContent = "?", add("th", thead).textContent = "#";
  const tbody = add("tbody", table);
  for (let z = 0; z < spots.length; ++z) row(tbody, spots[z], states[z]);
};
const new_form = (
  tbody: HTMLTableSectionElement,
  spots: Spot[],
  states: number[],
) => {
  const form = add("form");
  const label_field = add(
    "input",
    add("label", form, { textContent: "Label" }),
    { name: "label", pattern: "^[ -~]{1,4095}$", required: true },
  );
  const alt_field = add(
    "input",
    add("label", form, { textContent: "Altitude" }),
    { name: "alt", type: "number", min: "-128", max: "127", required: true },
  );
  const submit = add("input", form, { type: "submit", value: "Add" });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    const state = await locate(public_key, alt_field.valueAsNumber);
    const spot = {
      label: label_field.value,
      lat: state.lat,
      lon: state.lon,
      alt: state.alt,
    };
    spots.push(spot);
    states.push(1);
    row(tbody, spot, 1);
    await fetch("/state", {
      method: "PUT",
      body: public_key + JSON.stringify(spots),
    });
    submit.disabled = false;
  });
};
fetch(`https://spots.nyoon.io/${public_key}`).then(async (response) => {
  const spots = await response.json();
  const response2 = await fetch("/spots", {
    method: "POST",
    body: JSON.stringify(spots),
  });
  add("output").textContent = await response2.text();
  // const states = await response2.json();
  // table(spots, states);
});
