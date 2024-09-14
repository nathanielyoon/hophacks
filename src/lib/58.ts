export const base58 = /^[1-9A-HJ-NP-Za-km-z]*$/;
const A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const B = new Uint8Array(256);
for (let z = 0; z < 58; ++z) B[A.charCodeAt(z)] = z;
const C = 3364, D = C * 58, E = D * 58, F = E * 58, G = F * 58, H = 0x100000000;
export const a_s58 = (bytes: Uint8Array) => {
  const a = bytes.length / 5, b = Math.ceil(a) * 5;
  let c = "", z = 0;
  while (z < b) {
    const d = bytes[z++] + (bytes[z++] << 8) + (bytes[z++] << 16) +
      (bytes[z++] << 24 >>> 0) + (bytes[z++] ?? 0) * H;
    c += A[d % 58] + A[Math.floor(d / 58) % 58] + A[(d / C | 0) % 58] +
      A[(d / D | 0) % 58] + A[(d / E | 0) % 58] + A[(d / F | 0) % 58] +
      A[(d / G | 0) % 58];
  }
  return c.slice(0, Math.ceil(a * 7));
};
export const s58_a = (string: string) => {
  const a = string.length, b = a / 7, c = new Uint8Array(Math.ceil(b * 5));
  let z = 0, y = 0;
  while (z < a) {
    const d = c[y++] = B[string.charCodeAt(z++)] +
      B[string.charCodeAt(z++) || 0] * 58 + B[string.charCodeAt(z++) || 0] * C +
      B[string.charCodeAt(z++) || 0] * D + B[string.charCodeAt(z++) || 0] * E +
      B[string.charCodeAt(z++) || 0] * F + B[string.charCodeAt(z++) || 0] * G;
    c[y++] = d >> 8, c[y++] = d >> 16, c[y++] = d >> 24, c[y++] = d / H;
  }
  return new Uint8Array(c.subarray(0, Math.floor(b * 5)));
};
