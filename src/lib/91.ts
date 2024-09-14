export const base91 = /^[!-&(-,.-[\]-~]*$/;
const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
const BUFFER = new Uint8Array(256);
for (let z = 0; z < 91; ++z) BUFFER[ALPHABET.charCodeAt(z)] = z;
export const buffer_base91 = (bytes: Uint8Array) => {
  let string = "", value = 0, shift = 0, z = 0;
  while (z < bytes.length) {
    value |= bytes[z++] << shift, shift += 8;
    if (shift > 13) {
      let d = value & 0x1fff;
      if (d > 88) value >>= 13, shift -= 13;
      else d |= value & 0x2000, value >>= 14, shift -= 14;
      string += ALPHABET[d % 91] + ALPHABET[d / 91 | 0];
    }
  }
  if (shift > 7 || value > 90) {
    string += ALPHABET[value % 91] + ALPHABET[value / 91 | 0];
  } else if (shift) string += ALPHABET[value % 91];
  return string;
};
export const base91_buffer = (string: string) => {
  const length = string.length;
  const padded = length & ~1;
  const buffer = new Uint8Array(length << 1);
  let value = 0, shift = 0, z = 0, y = 0;
  while (z < padded) {
    const f = BUFFER[string.charCodeAt(z++)] +
      91 * BUFFER[string.charCodeAt(z++)];
    value |= f << shift, shift += (f & 0x1fff) > 88 ? 13 : 14;
    do buffer[y++] = value, value >>= 8, shift -= 8; while (shift > 7);
  }
  if (length > padded) {
    buffer[y++] = value | BUFFER[string.charCodeAt(padded)] << shift;
  }
  return new Uint8Array(buffer.subarray(0, y));
};
