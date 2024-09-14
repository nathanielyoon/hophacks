import { Errer } from "./error.ts";

export type Input =
  | { type: "boolean" }
  | { type: "radio"; options: readonly [string, ...string[]] }
  | { type: "checkbox"; options: readonly [string, ...string[]] }
  | { type: "number"; min?: number; max?: number; step?: "any" | number }
  | { type: "date"; min?: Date; max?: Date }
  | { type: "email"; minlength?: number; maxlength?: number; pattern?: RegExp }
  | { type: "url"; minlength?: number; maxlength?: number; pattern?: RegExp }
  | { type: "text"; minlength?: number; maxlength?: number; pattern?: RegExp };
export type Value<A extends Input> = A extends { type: "boolean" } ? boolean
  : A extends { options: infer B extends readonly string[] }
    ? A extends { type: "radio" } ? B[number] : Set<B[number]>
  : A extends { type: "number" } ? number
  : A extends { type: "date" } ? Date
  : A extends { type: "url" } ? URL
  : A extends { type: "email" | "text" } ? string
  : never;
export const BOOLEAN = /^(0|no|false)$|^(1|yes|true)$/i;
export const EMAIL =
  /^(?![ -~]{255,})[\w!#-'*+./=?^-~-]+@[\dA-Z](?:[-\dA-Z]{0,61}[\dA-Z])?(?:\.[\dA-Z](?:[-\dA-Z]{0,61}[\dA-Z])?)*$/i;
export type Json = null | boolean | number | string | Json[] | {
  [_: string]: Json;
};
export class JSONError extends Errer<[json: string, error: SyntaxError]> {}
export const safe = <A extends Json>(json: string) => {
  try {
    return <A> JSON.parse(json);
  } catch (Z) {
    throw new JSONError([json, Z]);
  }
};
export class InputError<A extends Input>
  extends Errer<[input: A, key: keyof A, value?: string]> {
  static from(thrown: unknown, value: string) {
    if (thrown instanceof InputError) return thrown.cause[2] = value, thrown;
    throw thrown;
  }
  constructor(input: A, key: keyof A, value?: string) {
    super("", [input, key, value]);
  }
}
export const boolean = (input: Input & { type: "boolean" }, value: string) => {
  const a = BOOLEAN.exec(value);
  if (a?.[1]) return false;
  if (a?.[2]) return true;
  throw new InputError(input, "type");
};
export const radio = <A extends string>(
  input: Input & { type: "radio"; options: readonly A[] },
  value: string,
) => {
  if (input.options.includes(value)) return <A> value;
  throw new InputError(input, "options");
};
export const checkbox = <A extends string>(
  input: Input & { type: "checkbox"; options: readonly A[] },
  value: string,
) => {
  const a = safe(value);
  if (!Array.isArray(a)) throw new InputError(input, "type");
  const b = new Set<A>(), c = [];
  for (let z = 0; z < a.length; ++z) {
    const d = `${a[z]}`;
    input.options.includes(d) ? b.add(<A> d) : c.push(d);
  }
  if (c.length) throw new InputError(input, "options");
  return b;
};
export const number = (input: Input & { type: "number" }, value: string) => {
  const a = +value;
  if (isNaN(a)) throw new InputError(input, "type");
  if (input.min !== undefined && a < input.min) {
    throw new InputError(input, "min");
  }
  if (input.max !== undefined && a > input.max) {
    throw new InputError(input, "max");
  }
  switch (input.step) {
    case undefined:
      if (!Number.isSafeInteger(a)) throw new InputError(input, "step");
      break;
    case "any":
      if (!isFinite(a)) throw new InputError(input, "step");
      break;
    default:
      if (a % input.step) throw new InputError(input, "step");
      break;
  }
  return a;
};
export const date = (input: Input & { type: "date" }, value: string) => {
  const a = +value;
  if (isNaN(a)) throw new InputError(input, "type");
  if (input.min !== undefined && a < +input.min) {
    throw new InputError(input, "min");
  }
  if (input.max !== undefined && a > +input.max) {
    throw new InputError(input, "max");
  }
  return new Date(a);
};
export const email = (input: Input & { type: "email" }, value: string) => {
  const a = text(input, value);
  if (!EMAIL.test(a)) throw new InputError(input, "type");
  return a;
};
export const url = (input: Input & { type: "url" }, value: string) => {
  const a = text(input, value);
  try {
    return new URL(a);
  } catch {
    throw new InputError(input, "type");
  }
};
export const text = (
  input: Input & { type: "email" | "url" | "text" },
  value: string,
) => {
  if (input.minlength !== undefined && value.length < input.minlength) {
    throw new InputError(input, "minlength");
  }
  if (input.maxlength !== undefined && value.length > input.maxlength) {
    throw new InputError(input, "maxlength");
  }
  if (input.pattern !== undefined && !input.pattern.test(value)) {
    throw new InputError(input, "pattern");
  }
  return value;
};
