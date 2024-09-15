import { Errer, UnreachableError } from "./lib/error.ts";
import { Data, Form, parse } from "./lib/form.ts";

type Env = {
  XATA_API_KEY: string;
  XATA_SPOTS_URL: string;
  XATA_STATE_URL: string;
  S3_HOST: string;
  S3_ID: string;
  S3_KEY: string;
};
export const on = <A extends Form>(
  form: A,
  handle: (env: Env, body: Data<A>) => Response | Promise<Response>,
) =>
(context: { env: Env; request: Request }) =>
  context.request.text().then((text) => handle(context.env, parse(form, text)))
    .catch((error) =>
      new Response(JSON.stringify(error.toJSON?.() ?? `${error}`), {
        status: error instanceof Errer
          ? error instanceof UnreachableError ? 500 : 400
          : 500,
      })
    );
