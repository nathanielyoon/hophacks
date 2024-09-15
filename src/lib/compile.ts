import { Spot } from "../lib/xata.ts";

export const compile = (key: string, spots: Spot[]) => {
  return `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${key}</title>
  <script type="module" src="https://hophacks.nyoon.io/static/spots.ts"></script>
  <link rel="stylesheet" href="https://hophacks.nyoon.io/static/spots.css">
</head>

<body>
  <output>
    ${JSON.stringify(spots)}
  </output>
</body>`;
};
