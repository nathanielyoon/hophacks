const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const TABLE = new Uint8Array(256);
for (let z = 0; z < 64; ++z) TABLE[ALPHABET.charCodeAt(z)] = z;
export const buffer_base64 = (bytes: Uint8Array) => {
  let string = "", z = 0;
  while (z < bytes.length) {
    const value = bytes[z++] << 16 |
      (bytes[z++] ?? 0) << 8 |
      (bytes[z++] ?? 0);
    string += ALPHABET[value >> 18] +
      ALPHABET[value >> 12 & 63] +
      ALPHABET[value >> 6 & 63] +
      ALPHABET[value & 63];
  }
  return string.slice(0, Math.ceil(bytes.length / 3 * 4));
};
export const base64_buffer = (string: string) => {
  const buffer = new Uint8Array(string.length * 3 >> 2);
  let z = 0, y = 0;
  while (z < string.length) {
    const value = TABLE[string.charCodeAt(z++)] << 18 |
      TABLE[string.charCodeAt(z++) || 0] << 12 |
      TABLE[string.charCodeAt(z++) || 0] << 6 |
      TABLE[string.charCodeAt(z++) || 0];
    buffer[y++] = value >> 16;
    buffer[y++] = value >> 8;
    buffer[y++] = value;
  }
  return buffer;
};
