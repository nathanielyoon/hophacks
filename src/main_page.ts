import { generate, sign } from "./lib/25519.ts";
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
  add("th", thead).textContent = "Label",
    add("th", thead).textContent = "People";
  const tbody = add("tbody", table);
  for (let z = 0; z < spots.length; ++z) row(tbody, spots[z], states[z]);
  return tbody;
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
    add("label", form, { textContent: "Level" }),
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
    const json = JSON.stringify(spots);
    const signature = sign(secret_key, new TextEncoder().encode(json));
    await fetch("/spots", {
      method: "PUT",
      body: public_key + json + a_s58(signature),
    });
    submit.disabled = false;
  });
};
// fetch(`https://spots.nyoon.io/${public_key}`).then(async (response) => {
//   const spots = await response.json();
//   const response2 = await fetch("/spots", {
//     method: "POST",
//     body: JSON.stringify(spots),
//   });
//   const states = await response2.json();
// });
const spots = [
  { label: "my nice spot :)", lat: 96.321321323, lon: -36.09182839012, alt: 1 },
  { label: "my other spot >:(", lat: 95.889898, lon: -36.676124, alt: 1 },
];
const states = [1, 2];
new_form(table(spots, states), spots, states);
const div = add("div");
const one = add("button", div, {
  textContent: "CHECK IN",
});
one.onclick = () => (one.disabled = true, two.disabled = false);
const two = add("button", div, {
  textContent: "CHECK OUT",
});
two.onclick = () => (two.disabled = true, one.disabled = false);
