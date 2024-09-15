import { base58 } from "./58.ts";
import { Errer, UnreachableError } from "./error.ts";
import { Data, Form, parse } from "./form.ts";
import { Input, Json } from "./input.ts";

const DISTANCE = 2.4e-6;
export const key = {
  type: "text",
  minlength: 45,
  maxlength: 45,
  pattern: base58,
} satisfies Input;
type Env = {
  XATA_KEY: string;
  XATA_URL: string;
  R2: {
    put: (key: string, value: string, options: {
      onlyIf: { uploadedBefore: Date };
      httpMetadata: {
        contentType: string;
        contentDisposition: string;
        cacheControl: string;
      };
    }) => Promise<{} | null>;
  };
};
export type Context = { env: Env; request: Request };
export const error = (caught: unknown) =>
  new Response(Errer.json(caught), {
    status: caught instanceof Errer
      ? caught instanceof UnreachableError ? 500 : 400
      : 500,
  });
const lat = { type: "number", step: "any", min: -90, max: 90 } satisfies Input,
  lon = { type: "number", step: "any", min: -180, max: 180 } satisfies Input,
  alt = { type: "number", min: -0x80, max: 0x7f } satisfies Input;
export const STATE = {
  key,
  timestamp: { type: "number", min: 0, max: 0xfffffff },
  lat,
  lon,
  alt,
} satisfies Form;
export type State = Data<typeof STATE>;
export const SPOT = {
  label: { type: "text", maxlength: 0x1000 },
  lat,
  lon,
  alt,
} satisfies Form;
export type Spot = Data<typeof SPOT>;
const xata = (env: Env, path: string, body: Json) =>
  fetch(`${env.XATA_URL}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.XATA_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
export const GET = (env: Env, body: Spot[]) => {
  const columns = Array(body.length);
  for (let z = 0; z < body.length; ++z) {
    const spot = body[z];
    columns[z] = {
      lat: { $all: { $le: spot.lat + DISTANCE, $ge: spot.lat - DISTANCE } },
      lon: { $all: { $le: spot.lon + DISTANCE, $ge: spot.lon - DISTANCE } },
      alt: spot.alt,
    };
  }
  return xata(env, "tables/state/query", {
    columns: ["timestamp"],
    filter: columns.length ? { $any: columns } : {},
  })
    .then((response) => response.json()).then((json) => {
      const records: { timestamp: number }[] = json.records;
      const states = Array<number>(records.length);
      for (let z = 0; z < records.length; ++z) states[z] = records[z].timestamp;
      return new Response(JSON.stringify(states));
    });
};
export const DELETE = (env: Env, body: { key: string }) =>
  xata(env, "sql", {
    statement: `DELETE FROM state WHERE "key" = '${body.key}'`,
  });
export const POST = (env: Env, body: State) =>
  DELETE(env, body).then(() => xata(env, "tables/state/data", body));
export const PUT = (env: Env, key: string, value: Spot[]) =>
  env.R2.put(key, JSON.stringify(value), {
    onlyIf: { uploadedBefore: new Date(1632844800000) },
    httpMetadata: {
      contentDisposition: "inline",
      contentType: "application/json",
      cacheControl: "no-cache",
    },
  }).then((ok) => new Response());
