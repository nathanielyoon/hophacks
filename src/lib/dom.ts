import { Errer } from "./error.ts";

type Tag = keyof HTMLElementTagNameMap;
class MissingElementError extends Errer<{ tag: string; parent: HTMLElement }> {}
export const $: {
  <A extends Tag>(tag: A, parent?: HTMLElement): HTMLElementTagNameMap[A];
  <A extends Tag>(tag: string, parent?: HTMLElement): HTMLElementTagNameMap[A];
} = (tag, parent = document.body) => {
  const a = parent.querySelector(tag);
  if (!a) throw new MissingElementError({ tag, parent }); // never returns null
  return a;
};
export const add = <A extends Tag>(
  tag: A,
  parent: HTMLElement | null = document.body,
  attributes?: {
    [B in keyof HTMLElementTagNameMap[A]]?: HTMLElementTagNameMap[A][B];
  },
) => {
  const element = document.createElement(tag);
  parent?.appendChild(element);
  if (!attributes) return element;
  const keys = <(keyof HTMLElementTagNameMap[A])[]> Object.keys(attributes);
  for (let z = 0; z < keys.length; ++z) {
    const key = keys[z], value = attributes[key];
    if (value !== undefined) element[key] = value;
  }
  return element;
};
