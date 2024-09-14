import { sha512 } from "./hash.ts";

type Point = [X: bigint, Y: bigint, Z: bigint, T: bigint];
const P = (1n << 255n) - 19n,
  N = (1n << 252n) + 0x14def9dea2f79cd65812631a5cf5d3edn,
  D = 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  X = 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Y = BigInt(`0x${"6".repeat(62)}58`),
  T = X * Y % P,
  R = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n,
  G = Array<Point>(4224);
const p = (value: bigint, modulus = P) => (value % modulus + modulus) % modulus;
const x = (first: bigint, second = first) => first * second % P;
const r = (base: bigint, power: number) => {
  do base = x(base); while (--power);
  return base;
};
const v = (divisor: bigint) => {
  let a = 0n, b = p(divisor), c = P, d = 1n, e = 1n, f = 0n, g, h;
  while (g = b) {
    b = c % g, c /= g, h = a - e * c, d = f, f = d - f * c, c = g, a = e, e = h;
  }
  return p(a);
};
const s = (bytes: Uint8Array) => {
  const a = new DataView(sha512(bytes).buffer);
  return (a.getBigUint64(0, true) |
    a.getBigUint64(8, true) << 64n |
    a.getBigUint64(16, true) << 128n |
    a.getBigUint64(24, true) << 192n |
    a.getBigUint64(32, true) << 256n |
    a.getBigUint64(40, true) << 320n |
    a.getBigUint64(48, true) << 384n |
    a.getBigUint64(56, true) << 448n) % N;
};
const t = (Z: bigint) => {
  const a = x(Z, x(Z)), b = x(Z, r(x(a, r(a, 2)), 1)), c = x(b, r(b, 5));
  const d = x(c, r(c, 10)), e = x(d, r(d, 20)), f = x(e, r(e, 40));
  return [x(Z, r(x(c, r(x(f, r(x(f, r(f, 80)), 80)), 10)), 2)), a];
};
const add = (Z: Point, Y: Point) => {
  const a = x(Z[0], Y[0]) + x(Z[1], Y[1]), b = x(Z[0] + Z[1], Y[0] + Y[1]) - a;
  const c = x(Z[3] * D, Y[3]), d = x(Z[2], Y[2]) - c, e = d + c + c;
  Z[0] = p(b * d), Z[1] = p(e * a), Z[2] = p(d * e), Z[3] = p(b * a);
};
const double = (Z: Point) => {
  const a = x(Z[0]), b = x(Z[1]), c = x(Z[0] + Z[1]) - a - b, d = P - a;
  const e = d + b, f = d - b, g = e - x(2n, x(Z[2]));
  Z[0] = p(c * g), Z[1] = p(e * f), Z[2] = p(g * e), Z[3] = p(c * f);
};
{
  let a: Point = [X, Y, 1n, T], b: Point = [X, Y, 1n, T], z = 33, y = 0, x;
  do {
    G[y++] = b = [a[0], a[1], a[2], a[3]], x = 127;
    do add(G[y++] = b = [b[0], b[1], b[2], b[3]], a); while (--x);
    double(a = [b[0], b[1], b[2], b[3]]);
  } while (--z);
}
const wnaf = (scalar: bigint) => {
  const a: Point = [0n, 1n, 1n, 0n], b: Point = [X, Y, 1n, T];
  let c = <Point> Array(4), d, e, z = 0;
  do d = Number(scalar & 255n),
    scalar >>= 8n,
    d > 128 && (d -= 256, ++scalar),
    e = G[d ? (z << 7) + Math.abs(d) - 1 : z << 7],
    c = [P - e[0], e[1], e[2], P - e[3]],
    d ? add(a, d < 0 ? c : e) : add(b, z & 1 ? c : e); while (++z < 33);
  return a;
};
const ladder = (k: bigint, u: bigint) => {
  let a = 1n, b = 0n, c = u, d = 1n, e = 0n, f, g, z = 254n;
  do {
    f = -(e ^ (e = k >> z & 1n)), a ^= g = f & (a ^ c), b ^= f &= b ^ d, c ^= g;
    d ^= f, f = x(c + d, a -= b), g = x(c - d, b += a + b), d = x(u, x(g - f));
    c = x(g + f), a = x(b = x(b), g = x(a)), b = x(b + x(b -= g, 121665n), b);
  } while (z--);
  return [b, d] = t(b ^ -e & (b ^ d)), p((a ^ -e & (a ^ c)) * x(d, r(b, 3)));
};
const q = (Z: Uint8Array) => (Z[0] &= 248, Z[31] &= 127, Z[31] |= 64, Z);
const a_k = (key: Uint8Array) => a_i(q(sha512(key.subarray(0, 32))));
const a_i = (bytes: Uint8Array, Y = 0) => {
  const a = new DataView(bytes.buffer);
  return a.getBigUint64(Y, true) | a.getBigUint64(Y + 8, true) << 64n |
    a.getBigUint64(Y + 16, true) << 128n | a.getBigUint64(Y + 24, true) << 192n;
};
const i_a = (big: bigint) => {
  const a = new Uint8Array(32), b = new DataView(a.buffer);
  b.setBigUint64(16, big >> 128n, true), b.setBigUint64(24, big >> 192n, true);
  return b.setBigUint64(0, big, true), b.setBigUint64(8, big >> 64n, true), a;
};
const a_e = (bytes: Uint8Array) => {
  const a = a_i(bytes) & ~(1n << 255n);
  if (a >= P) throw 0;
  const b = x(a), c = p(~-b), d = p(D * b + 1n), e = x(d, x(d));
  let f = p(c * e * t(x(c, p(d * e * e)))[0]);
  const g = p(d * f * f);
  if (g === p(-c)) f = p(f * R);
  else if (g !== c) throw 1;
  const h = bytes[31] >> 7;
  if (!f && h) throw 2;
  if (Number(f & 1n) ^ h) f = P - f;
  return [f, a, 1n, x(f, a)] satisfies Point;
};
const e_a = (point: Point) => {
  const a = v(point[2]), b = i_a(p(point[1] * a));
  if (x(point[0], a) & 1n) b[31] |= 128;
  return b;
};
export const generate = (key: Uint8Array) => e_a(wnaf(a_k(key)));
export const sign = (secret_key: Uint8Array, message: Uint8Array) => {
  const a = message.length, b = new Uint8Array(a + 64), c = sha512(secret_key);
  b.set(c.subarray(32)), b.set(message, 32);
  const d = s(b.subarray(0, a + 32)), e = e_a(wnaf(d)), f = a_i(q(c));
  b.set(e), b.set(e_a(wnaf(f)), 32), b.set(message, 64);
  return c.set(e), c.set(i_a(p(d + p(s(b) * f, N), N)), 32), c;
};
export const verify = (
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array,
) => {
  try {
    const a = a_i(signature, 32);
    if (a >= N) return false;
    const b: Point = [0n, 1n, 1n, 0n], c = new Uint8Array(message.length + 64);
    c.set(signature), c.set(public_key, 32), c.set(message, 64);
    let d = s(c);
    let e = a_e(public_key);
    while (d) d & 1n && add(b, e), double(e), d >>= 1n;
    e = wnaf(a), add(b, a_e(signature));
    return !(p(b[0] * e[2]) ^ p(b[2] * e[0]) | p(b[1] * e[2]) ^ p(b[2] * e[1]));
  } catch {
    return false;
  }
};
export const exchange = (secret_key: Uint8Array, public_key: Uint8Array) => {
  const a = a_k(secret_key), b = e_a(wnaf(a)), c = a_e(public_key)[1];
  const d = i_a(ladder(a, p((1n + c) * v(1n - c)) & ~(1n << 255n)));
  let e = 0, z = 32;
  do e |= d[--z], b[z] ^= public_key[z]; while (z);
  return e &&
    crypto.subtle.importKey("raw", d, "HKDF", false, ["deriveBits"]).then((Z) =>
      crypto.subtle.deriveBits(
        { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: b },
        Z,
        256,
      )
    ).then((Z) => new Uint8Array(Z));
};
