import { sign, verify } from "./25519.ts";
import { base58, s58_a } from "./58.ts";
import { a_s64, s64_a } from "./64.ts";
import { Errer } from "./error.ts";
import { type Data, type Form, parse } from "./form.ts";

class JWTError extends Errer<[token: string, code: 400 | 401 | 403]> {}
const EXPIRATION_BUFFER = 900;
const b58 = base58.source.slice(1, -2);
export const key = { type: "text", pattern: RegExp(`^${b58}{45}$`) } as const;
export const payload = {
  iss: key,
  sub: key,
  ctx: { type: "text", minlength: 0, maxlength: 0x10000 },
  exp: { type: "number", min: 0, max: 0xffffffff },
} satisfies Form;
const s_a: (string: string) => Uint8Array = /* @__PURE__ */ TextEncoder
  .prototype.encode.bind(new TextEncoder());
export const entoken = (secret_key: Uint8Array, jwt: Data<typeof payload>) => {
  const a = "eyJhbGciOiJFZERTQSJ9." + a_s64(s_a(JSON.stringify(jwt)));
  return `${a}.${a_s64(sign(secret_key, s_a(a)))}`;
};
export const detoken = (token: string) => {
  const a = /^Bearer (.+)/i.exec(token)?.[1];
  if (!a) throw new JWTError("invalid_request", [token, 400]);
  const b = /^(eyJhbGciOiJFZERTQSJ9\.([-\w]+))\.([-\w]{86})$/.exec(a);
  if (!b) throw new JWTError("unauthorized", [token, 401]);
  const c = parse(payload, new TextDecoder().decode(s64_a(b[2])));
  if (c.exp + EXPIRATION_BUFFER - Date.now() / 1000 < 0) {
    throw new JWTError("invalid_token", [token, 401]);
  }
  if (!verify(s58_a(c.iss), s_a(b[1]), s64_a(b[3]))) {
    throw new JWTError("insufficient_scope", [token, 403]);
  }
  return c;
};
