import { hmac, sha256 } from "./hash.ts";

const LOWER = Array<string>(256), UPPER = Array<string>(256);
for (let z = 0; z < 256; ++z) {
  UPPER[z] = (LOWER[z] = z.toString(16).padStart(2, "0")).toUpperCase();
}
const bytes_base16 = (bytes: Uint8Array) => {
  let string = "";
  for (let z = 0; z < bytes.length; ++z) string += LOWER[bytes[z]];
  return string;
};
const iso = (date: Date) => date.toISOString().replace(/[:-]|\..../g, "");
const scope = (timestamp: string, region: string) =>
  `${timestamp.slice(0, 8)}/${region}/s3/aws4_request`;
const query = (
  id: string,
  date: number,
  signed_headers: string[],
  region: string,
  expires: number,
) =>
  `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${id}%2F${
    scope(id = iso(new Date(date * 1000)), region)
      .replace(/[^-.\w~]/g, (a) => "%" + UPPER[a.charCodeAt(0)])
  }&X-Amz-Date=${id}&X-Amz-Expires=${expires}&X-Amz-SignedHeaders=${
    signed_headers.join("%3B")
  }`;
const encode = TextEncoder.prototype.encode.bind(new TextEncoder());
export const presign = (
  env: { S3_HOST: string; S3_ID: string; S3_KEY: string },
  path: string,
  method: "PUT" | "GET" | "HEAD" = "PUT",
  headers: { [a: string]: string } = {},
  expires = 604800,
  region = "auto",
  date = new Date(),
) => {
  const a = new URL(env.S3_HOST);
  const b = iso(date), c = date.getTime() / 1000 >>> 0;
  const d: { [a: string]: string } = { host: a.hostname };
  for (let z = 0, e = Object.keys(headers), f; z < e.length; ++z) {
    f = e[z], d[f.trim().toLowerCase()] = headers[f].trim();
  }
  const e = Object.keys(d).sort();
  let f = "";
  for (let z = 0, g; z < e.length; ++z) f += `${g = e[z]}:${d[g]}\n`;
  const h = query(env.S3_ID, c, e, region, expires);
  const i = bytes_base16(sha256(encode(
    `${method}\n/${path}\n${h}\n${f}\n${e.join(";")}\nUNSIGNED-PAYLOAD`,
  )));
  const j = hmac(encode(`AWS4${env.S3_KEY}`), encode(b.slice(0, 8)));
  const k = bytes_base16(hmac(
    hmac(
      hmac(hmac(j, encode(region)), new Uint8Array([115, 51])),
      new Uint8Array([97, 119, 115, 52, 95, 114, 101, 113, 117, 101, 115, 116]),
    ),
    encode(`AWS4-HMAC-SHA256\n${b}\n${scope(b, region)}\n${i}`),
  ));
  return `https://${a.hostname}/${path}?${h}&X-Amz-Signature=${k}`;
};
