const STRING = Array<string>(256);
const NUMBER: { [_: string]: number } = {};
for (let z = 0; z < 256; ++z) {
  NUMBER[STRING[z] = z.toString(16).padStart(2, "0")] = z;
}
export const buffer_base16 = (bytes: Uint8Array) => {
  let base16 = "", z = 0;
  while (z < bytes.length) base16 += STRING[bytes[z++]];
  return base16;
};
export const base16_buffer = (string: string) => {
  const buffer = new Uint8Array(string.length >>> 1);
  let z = 0;
  while (z < string.length) buffer[z >>> 1] = NUMBER[string[z++] + string[z++]];
  return buffer;
};
