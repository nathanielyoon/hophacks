import { Spot, State } from "../lib/xata.ts";

export const build = (key: string, spots: [Spot, State[]][], state?: State) => {
  const url = `https://spots.nyoon.io/${key}`;
  return `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${key}</title>
</head>

<body>
  <header>
    <a href="${url}">${url}</a>
  </header>
  <main>
    <section>
      <table>
        <thead>
          <th>location</th>
          <th>range</th>
          <th>people</th>
        </thead>
        <tbody>
          ${
    spots.map(([spot, state]) =>
      `<tr>
  <td>${spot.label}</td>
  <td>${spot.range}</td>
  <td>${state.length}</td>
</tr>`
    )
  }
        </tbody>
      </table>
      <menu>
        <li>
          <button>New</button>
        </li>
        <li>
          <button>Edit</button>
        </li>
      </menu>
    </section>
    <section>
      <form>
        ${
    state
      ? `<label>Checked in since ${
        new Date(state.timestamp * 1000).toISOString()
      }</label>
  <input type="submit" value="check out :(">`
      : `<label>Level
  <input name="alt" type="number" min="-128" max="127">
</label>
<input type="submit" value="check in :)">`
  }
      </form>
    </section>
  </main>
</body>
`;
};
