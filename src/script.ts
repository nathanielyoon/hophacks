import { add } from "./lib/dom.ts";
import { $, $$ } from "./lib/dom.ts";

let values: null | [string, string][] = null;
const edit_button = $<"button">("menu :nth-child(2) button");
const rows = $$<"tr">("tbody tr");
edit_button.addEventListener("click", () => {
  if (values === null) {
    values = Array(rows.length);
    for (let z = 0; z < rows.length; ++z) {
      const [location, range] = rows[z].cells;
      const current_location = location.textContent ?? "";
      const current_range = range.textContent ?? "";
      values[z] = [current_location, current_range];
      location.firstChild?.replaceWith(add("input", null, {
        value: current_location,
      }));
      range.firstChild?.replaceWith(add("input", null, {
        value: current_range,
        type: "number",
        min: "-128",
        max: "127",
      }));
    }
    edit_button.textContent = "Save";
  } else {
    const original_html = document.documentElement.outerHTML;
    for (let z = 0; z < rows.length; ++z) {
      const [location, range] = rows[z].cells;
      const [original_location, original_range] = values[z];
      location.textContent =
        (<HTMLInputElement> location.firstElementChild).value ||
        original_location;
      range.textContent = (<HTMLInputElement> range.firstElementChild).value ||
        original_range;
    }
    edit_button.textContent = "Edit";
    const now_html = document.documentElement.outerHTML;
    if (now_html !== original_html) {
    }
    values = null;
  }
});
