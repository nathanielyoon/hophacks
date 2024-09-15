import { parse } from "../src/lib/form.ts";
import { Context, DELETE, error, POST, STATE } from "../src/lib/xata.ts";

export const onRequestPost = (context: Context) =>
  context.request.text()
    .then((text) => POST(context.env, parse(STATE, text)))
    .catch(error);
export const onRequestDelete = (context: Context) =>
  context.request.text()
    .then((text) => DELETE(context.env, parse(STATE, text)))
    .catch(error);
