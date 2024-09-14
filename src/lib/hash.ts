const hex = (string: string) =>
  Uint32Array.from(
    { length: string.length >>> 3 },
    (_, Z) => parseInt(string.slice(Z <<= 3, Z + 8), 16),
  );
const HIGH_512 = hex(
    "428a2f9871374491b5c0fbcfe9b5dba53956c25b59f111f1923f82a4ab1c5ed5d807aa9812835b01243185be550c7dc372be5d7480deb1fe9bdc06a7c19bf174e49b69c1efbe47860fc19dc6240ca1cc2de92c6f4a7484aa5cb0a9dc76f988da983e5152a831c66db00327c8bf597fc7c6e00bf3d5a7914706ca63511429296727b70a852e1b21384d2c6dfc53380d13650a7354766a0abb81c2c92e92722c85a2bfe8a1a81a664bc24b8b70c76c51a3d192e819d6990624f40e3585106aa07019a4c1161e376c082748774c34b0bcb5391c0cb34ed8aa4a5b9cca4f682e6ff3748f82ee78a5636f84c878148cc7020890befffaa4506cebbef9a3f7c67178f2ca273eced186b8c7eada7dd6f57d4f7f06f067aa0a637dc5113f98041b710b3528db77f532caab7b3c9ebe0a431d67c44cc5d4be597f299c5fcb6fab6c44198c",
  ),
  LOW_512 = hex(
    "d728ae2223ef65cdec4d3b2f8189dbbcf348b538b605d019af194f9bda6d8118a303024245706fbe4ee4b28cd5ffb4e2f27b896f3b1696b125c71235cf6926949ef14ad2384f25e38b8cd5b577ac9c65592b02756ea6e483bd41fbd4831153b5ee66dfab2db4321098fb213fbeef0ee43da88fc2930aa725e003826f0a0e6e7046d22ffc5c26c9265ac42aed9d95b3df8baf63de3c77b2a847edaee61482353b4cf10364bc423001d0f897910654be30d6ef52185565a9105771202a32bbd1b8b8d2d0c85141ab53df8eeb99e19b48a8c5c95a63e3418acb7763e373d6b2b8a35defb2fc43172f60a1f0ab721a6439ec23631e28de82bde9b2c67915e372532bea26619c21c0c207cde0eb1eee6ed17872176fbaa2c898a6bef90dae131c471b23047d8440c7249315c9bebc9c100d4ccb3e42b6fc657e2a3ad6faec4a475817",
  ),
  INITIAL_512 = hex(
    "6a09e667f3bcc908bb67ae8584caa73b3c6ef372fe94f82ba54ff53a5f1d36f1510e527fade682d19b05688c2b3e6c1f1f83d9abfb41bd6b5be0cd19137e2179",
  ),
  INITIAL_256 = INITIAL_512.filter((_, Z) => Z & 1 ^ 1),
  HIGH_BUFFER = new Uint32Array(80),
  LOW_BUFFER = new Uint32Array(80);
const merkle_damgard = (
  initial: Uint32Array,
  size: number,
  words: number,
  block: (from: Uint8Array, at: number, to: Uint32Array) => void,
) =>
(data: Uint8Array) => {
  const length = data.length;
  const hash = new Uint32Array(initial);
  const buffer = new Uint8Array(size);
  let z = 0, y = 0;
  while (z < length) {
    const block_size = Math.min(size - y, length - z);
    if (block_size !== size) {
      buffer.set(data.subarray(z, z += block_size)), y += block_size;
    } else while (length - z >= size) block(data, z, hash), z += size;
  }
  buffer[y++] = 128, size - y < size >> 3 && block(buffer, y = 0, hash);
  const view = new DataView(buffer.fill(0, y).buffer);
  view.setBigUint64(size - 8, BigInt(length) << 3n);
  block(buffer, y = z = 0, hash);
  do view.setUint32(z, hash[y]); while (z += 4, ++y < words);
  return new Uint8Array(buffer.subarray(0, words << 2));
};
export const sha512 = merkle_damgard(INITIAL_512, 128, 16, (from, at, to) => {
  let z = 0, a, b, c, d, e, f, g, h, i, j;
  do HIGH_BUFFER[z] = from[at++] << 24 | from[at++] << 16 | from[at++] << 8 |
    from[at++],
    LOW_BUFFER[z] = from[at++] << 24 | from[at++] << 16 | from[at++] << 8 |
      from[at++]; while (++z < 16);
  do a = HIGH_BUFFER[z - 15],
    b = LOW_BUFFER[z - 15],
    c = (a << 31 | b >>> 1) ^ (a << 24 | b >>> 8) ^ (a << 25 | b >>> 7),
    d = (a >>> 1 | b << 31) ^ (a >>> 8 | b << 24) ^ a >>> 7,
    a = HIGH_BUFFER[z - 2],
    b = LOW_BUFFER[z - 2],
    LOW_BUFFER[z] = c = (c >>> 0) + LOW_BUFFER[z - 7] + LOW_BUFFER[z - 16] +
      (((a << 13 | b >>> 19) ^ (a >>> 29 | b << 3) ^ (a << 26 | b >>> 6)) >>>
        0),
    HIGH_BUFFER[z] = d +
      ((a >>> 19 | b << 13) ^ (a << 3 | b >>> 29) ^ a >>> 6) +
      HIGH_BUFFER[z - 7] + HIGH_BUFFER[z - 16] +
      (c / 0x100000000 | 0); while (++z < 80);
  g = to[z = 0], h = to[1], i = to[2], j = to[3];
  let k = to[4], l = to[5], m = to[6], n = to[7], o = to[8], p = to[9];
  let q = to[10], r = to[11], s = to[12], t = to[13], u = to[14], v = to[15];
  do a = (o >>> 14 | p << 18) ^ (o >>> 18 | p << 14) ^ (o << 23 | p >>> 9),
    b = (o << 18 | p >>> 14) ^ (o << 14 | p >>> 18) ^ (o >>> 9 | p << 23),
    e = (v >>> 0) + (b >>> 0) + ((p & r ^ ~p & t) >>> 0) + LOW_512[z] +
      LOW_BUFFER[z],
    f = u + a + (o & q ^ ~o & s) + HIGH_512[z] + HIGH_BUFFER[z] +
        (e / 0x100000000 | 0) | 0,
    a = (g >>> 28 | h << 4) ^ (g << 30 | h >>> 2) ^ (g << 25 | h >>> 7),
    b = (g << 4 | h >>> 28) ^ (g >>> 2 | h << 30) ^ (g >>> 7 | h << 25),
    c = (g & i) ^ (g & k) ^ (i & k),
    d = (h & j) ^ (h & l) ^ (j & l),
    u = s,
    v = t,
    s = q,
    t = r,
    q = o,
    r = p,
    p = (n >>> 0) + (e >>> 0),
    o = m + f + (p / 0x100000000 | 0) | 0,
    m = k,
    n = l,
    k = i,
    l = j,
    i = g,
    j = h,
    h = (e >>> 0) + (b >>> 0) + (d >>> 0),
    g = f + a + c + (h / 0x100000000 | 0) | 0; while (++z < 80);
  to[0] += g + ((to[1] += h >>> 0) / 0x100000000 | 0);
  to[2] += i + ((to[3] += j >>> 0) / 0x100000000 | 0);
  to[4] += k + ((to[5] += l >>> 0) / 0x100000000 | 0);
  to[6] += m + ((to[7] += n >>> 0) / 0x100000000 | 0);
  to[8] += o + ((to[9] += p >>> 0) / 0x100000000 | 0);
  to[10] += q + ((to[11] += r >>> 0) / 0x100000000 | 0);
  to[12] += s + ((to[13] += t >>> 0) / 0x100000000 | 0);
  to[14] += u + ((to[15] += v >>> 0) / 0x100000000 | 0);
});
export const sha256 = merkle_damgard(INITIAL_256, 64, 8, (from, at, to) => {
  let z = 0, a, b, c = to[0], d = to[1], e = to[2], f = to[3], g = to[4];
  do HIGH_BUFFER[z] = from[at++] << 24 | from[at++] << 16 | from[at++] << 8 |
    from[at++]; while (++z < 16);
  do HIGH_BUFFER[z] =
    (((a = HIGH_BUFFER[z - 2]) >>> 17 | a << 15) ^ (a >>> 19 | a << 13) ^
      a >>> 10) +
    (((a = HIGH_BUFFER[z - 15]) >>> 7 | a << 25) ^ (a >>> 18 | a << 14) ^
      a >>> 3) +
    HIGH_BUFFER[z - 7] + HIGH_BUFFER[z - 16]; while (++z < 64);
  let h = to[5], i = to[6], j = to[7];
  do a = j +
    ((g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7)) +
    (g & h ^ ~g & i) + HIGH_512[64 - z] + HIGH_BUFFER[64 - z],
    b = ((c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10)) +
      (c & d ^ c & e ^ d & e),
    j = i,
    i = h,
    h = g,
    g = f + a,
    f = e,
    e = d,
    d = c,
    c = a + b; while (--z);
  to[0] += c, to[1] += d, to[2] += e, to[3] += f, to[4] += g, to[5] += h;
  to[6] += i, to[7] += j;
});
export const hmac = (key: Uint8Array, data: Uint8Array) => {
  const buffer = new Uint8Array(96);
  const stream = new Uint8Array(data.length + 64);
  buffer.set(key.length > 64 ? sha256(key) : key);
  let z = 0;
  do stream[z] = buffer[z] ^ 54; while (++z < 64);
  stream.set(data, 64), buffer.set(sha256(stream), 64);
  do buffer[--z] ^= 92; while (z);
  return sha256(buffer);
};
export const hkdf = (key: Uint8Array) => {
  const pseudorandom_key = hmac(new Uint8Array(32), key);
  return (info: Uint8Array) => {
    const buffer = new Uint8Array(info.length + 1);
    buffer.set(info), buffer[info.length] = 1;
    return hmac(pseudorandom_key, buffer);
  };
};
export const seed_key = (high: number, low: number, buffer?: Uint32Array) => {
  let a = low ^ 0xe5d2aff1, b = high ^ 0x5c0e8048, c = low ^ 0xc35ad9d8;
  let d = high ^ 0xfbdf7e14, z = 6;
  do a += b,
    b = (b << 5 | b >>> 27) ^ a,
    a = a << 16 | a >>> 16,
    c += d,
    d = (d << 8 | d >>> 24) ^ c,
    a += d,
    d = (d << 13 | d >>> 19) ^ a,
    c += b,
    b = (b << 7 | b >>> 25) ^ c,
    c = c << 16 | c >>> 16; while (--z);
  const into = buffer ?? new Uint32Array(12);
  into[0] = a, into[1] = b, into[2] = c, into[3] = d;
  into[4] = a << 1 ^ (d >>> 31 && 0x87), into[5] = b << 1 | a >>> 31;
  into[6] = c << 1 | b >>> 31, into[7] = d << 1 | c >>> 31;
  into[8] = into[4] << 1 ^ (into[7] >>> 31 && 0x87);
  into[9] = into[5] << 1 | into[4] >>> 31;
  into[10] = into[6] << 1 | into[5] >>> 31;
  into[11] = into[7] << 1 | into[6] >>> 31;
  return into;
};
const chaskeyer =
  (rounds: number, tag_length: number) =>
  (key: Uint32Array, data: Uint8Array) => {
    let a = key[0], b = key[1], c = key[2], d = key[3], length = data.length;
    let z = 0;
    const padded = ~-length & ~15, view_in = new DataView(data.buffer);
    for (let y = 0; y < padded; y += 16) {
      a ^= view_in.getUint32(y, true), b ^= view_in.getUint32(y + 4, true);
      c ^= view_in.getUint32(y + 8, true);
      d ^= view_in.getUint32(y + 12, true);
      z = rounds;
      do a += b,
        b = (b << 5 | b >>> 27) ^ a,
        a = a << 16 | a >>> 16,
        c += d,
        d = (d << 8 | d >>> 24) ^ c,
        a += d,
        d = (d << 13 | d >>> 19) ^ a,
        c += b,
        b = (b << 7 | b >>> 25) ^ c,
        c = c << 16 | c >>> 16; while (--z);
    }
    const low = length & 15;
    const buffer = new Uint8Array(16);
    const view_out = new DataView(buffer.buffer);
    if (length && !low) {
      buffer.set(data.subarray(padded, padded + 16));
      length = 4;
    } else {
      buffer.set(data.subarray(padded, padded + low));
      buffer[low] = 1;
      length = 8;
    }
    a ^= view_out.getUint32(0, true) ^ key[length++];
    b ^= view_out.getUint32(4, true) ^ key[length++];
    c ^= view_out.getUint32(8, true) ^ key[length++];
    d ^= view_out.getUint32(12, true) ^ key[length++];
    do a += b,
      b = (b << 5 | b >>> 27) ^ a,
      a = a << 16 | a >>> 16,
      c += d,
      d = (d << 8 | d >>> 24) ^ c,
      a += d,
      d = (d << 13 | d >>> 19) ^ a,
      c += b,
      b = (b << 7 | b >>> 25) ^ c,
      c = c << 16 | c >>> 16; while (++z < rounds);
    switch (tag_length) {
      case 16:
        view_out.setUint32(12, d ^ key[length - 1], true);
        view_out.setUint32(8, c ^ key[length - 2], true);
        /* falls through */
      case 8:
        view_out.setUint32(4, b ^ key[length - 3], true);
        /* falls through */
      case 4:
        view_out.setUint32(0, a ^ key[length - 4], true);
    }
    return new Uint8Array(buffer.subarray(0, 16));
  };
export const chaskey = /* @__PURE__ */ chaskeyer(16, 8);
export const oaat = (key: Uint8Array, seed: number) => {
  let a = seed ^ 0x3b00, b = seed << 15 | seed >>> 17, z = 0;
  while (z < key.length) a += key[z++], b -= a += a << 3, a = a << 7 | a >>> 25;
  return (a ^ b) >>> 0;
};
export const next = (state: number) => state * 0x39e2d >>> 0;
export const birthday = (codes: bigint, locations: bigint) => {
  const a = locations * (locations - 1n) / 2n;
  const b = ((codes - 1n) ** a).toString(16);
  const c = (codes ** a).toString(16);
  return 1 - parseInt(b.slice(0, 8), 16) / parseInt(
        c.slice(0, 8) + "0".repeat(c.length - b.length),
        16,
      );
};
