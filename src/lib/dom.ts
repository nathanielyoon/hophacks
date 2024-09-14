type Tag = keyof HTMLElementTagNameMap;
export const $: {
  <A extends Tag>(tag: A, parent?: HTMLElement): HTMLElementTagNameMap[A];
  <A extends HTMLElement>(tag: string, parent?: HTMLElement): A;
} = (tag: string, parent = document.body) => parent.querySelector(tag)!;
export const add = <A extends Tag>(
  tag: A,
  parent: HTMLElement,
  attributes?: {
    [B in keyof HTMLElementTagNameMap[A]]?: HTMLElementTagNameMap[A][B];
  },
) => {
  const a = parent.appendChild(document.createElement(tag));
  if (!attributes) return a;
  const b = <(keyof HTMLElementTagNameMap[A])[]> Object.keys(attributes);
  for (let z = 0; z < b.length; ++z) {
    const c = b[z], d = attributes[c];
    if (d !== undefined) a[c] = d;
  }
  return a;
};
