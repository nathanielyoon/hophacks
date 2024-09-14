import { Errer } from "./error.ts";
import {
  boolean,
  checkbox,
  date,
  email,
  Input,
  InputError,
  number,
  radio,
  safe,
  text,
  url,
  Value,
} from "./input.ts";

export type Form = { [_: string]: Input };
export type Data<A extends Form> = { [B in keyof A]: Value<A[B]> };
class NotRowError extends Errer {}
class MissingFieldError<A extends string> extends Errer<A> {}
type Errors<A extends Form> = {
  [B in string & keyof A]?:
    | [value: null, error: MissingFieldError<B>]
    | InputError<A[B]>;
};
export class FormError<A extends Form>
  extends Errer<[form: A, errors: Errors<A>]> {
  constructor(form: A, errors: Errors<A>) {
    super("", [form, errors]);
  }
}
export const stringify = (json: unknown) =>
  JSON.stringify(
    json,
    (_, value) => value instanceof Set ? [...value] : value,
  );
export const parse = <A extends Form>(form: A, row: unknown) => {
  if (typeof row === "string") row = safe(row);
  if (!row || typeof row !== "object") throw new NotRowError(row);
  const a = <(string & keyof A)[]> Object.keys(form), b = Object.values(row);
  const c: { [_: string]: unknown } = {}, d: Errors<A> = {};
  for (let z = 0; z < a.length; ++z) {
    const e = a[z], f = b[z];
    if (f === undefined) d[e] = [null, new MissingFieldError(e)];
    else {
      try {
        switch (form[e].type) {
          case "boolean":
            c[e] = boolean(form[e], f);
            break;
          case "radio":
            c[e] = radio(form[e], f);
            break;
          case "checkbox":
            c[e] = checkbox(form[e], f);
            break;
          case "number":
            c[e] = number(form[e], f);
            break;
          case "date":
            c[e] = date(form[e], f);
            break;
          case "email":
            c[e] = email(form[e], f);
            break;
          case "url":
            c[e] = url(form[e], f);
            break;
          case "text":
            c[e] = text(form[e], f);
            break;
        }
      } catch (Z) {
        d[e] = InputError.from(Z, f);
      }
    }
  }
  if (Object.keys(d).length) throw new FormError(form, d);
  return <Data<A>> c;
};
