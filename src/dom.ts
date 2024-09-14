type Tag = keyof HTMLElementTagNameMap;
export const $: {
  <A extends Tag>(tag: A, parent?: HTMLElement): HTMLElementTagNameMap[A];
  <A extends HTMLElement>(tag: string, parent?: HTMLElement): A;
} = (tag: string, parent = document.body) => parent.querySelector(tag)!;
export const add = <A extends Tag>(
  tag: A,
  parent = document.body,
  attributes?: {
    [B in keyof HTMLElementTagNameMap[A]]?: HTMLElementTagNameMap[A][B];
  },
) => {
  const element = parent.appendChild(document.createElement(tag));
  if (!attributes) return element;
  const keys = <(keyof HTMLElementTagNameMap[A])[]> Object.keys(attributes);
  for (let z = 0; z < keys.length; ++z) {
    const key = keys[z], value = attributes[key];
    if (value !== undefined) element[key] = value;
  }
  return element;
};
