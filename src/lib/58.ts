export const base58 = /^[1-9A-HJ-NP-Za-km-z]*$/;
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const TABLE = new Uint8Array(256);
for (let z = 0; z < 58; ++z) TABLE[ALPHABET.charCodeAt(z)] = z;
const POWER_2 = 3364;
const POWER_3 = POWER_2 * 58;
const POWER_4 = POWER_3 * 58;
const POWER_5 = POWER_4 * 58;
const POWER_6 = POWER_5 * 58;
export const buffer_base58 = (bytes: Uint8Array) => {
  const length = bytes.length / 5, padded = Math.ceil(length) * 5;
  let string = "", z = 0;
  while (z < padded) {
    const value = bytes[z++] +
      (bytes[z++] << 8) +
      (bytes[z++] << 16) +
      (bytes[z++] << 24 >>> 0) +
      (bytes[z++] ?? 0) * 0x100000000;
    string += ALPHABET[value % 58] +
      ALPHABET[Math.floor(value / 58) % 58] +
      ALPHABET[(value / POWER_2 | 0) % 58] +
      ALPHABET[(value / POWER_3 | 0) % 58] +
      ALPHABET[(value / POWER_4 | 0) % 58] +
      ALPHABET[(value / POWER_5 | 0) % 58] +
      ALPHABET[(value / POWER_6 | 0) % 58];
  }
  return string.slice(0, Math.ceil(length * 7));
};
export const base58_buffer = (string: string) => {
  const length = string.length;
  const unpadded = length / 7;
  const buffer = new Uint8Array(Math.ceil(unpadded * 5));
  let z = 0, y = 0;
  while (z < length) {
    const value = buffer[y++] = TABLE[string.charCodeAt(z++)] +
      TABLE[string.charCodeAt(z++) || 0] * 58 +
      TABLE[string.charCodeAt(z++) || 0] * POWER_2 +
      TABLE[string.charCodeAt(z++) || 0] * POWER_3 +
      TABLE[string.charCodeAt(z++) || 0] * POWER_4 +
      TABLE[string.charCodeAt(z++) || 0] * POWER_5 +
      TABLE[string.charCodeAt(z++) || 0] * POWER_6;
    buffer[y++] = value >> 8;
    buffer[y++] = value >> 16;
    buffer[y++] = value >> 24;
    buffer[y++] = value / 0x100000000;
  }
  return new Uint8Array(buffer.subarray(0, Math.floor(unpadded * 5)));
};
