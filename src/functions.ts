import { parse } from "./lib/form.ts";

export type Env = {
  XATA_API_KEY: string;
  XATA_SPOTS_URL: string;
  XATA_STATE_URL: string;
};
export type Context<A extends "spots" | "state"> =
  & Omit<EventContext<Env, A, never>, "request">
  & { request: Request };
export const on =
  <A extends "spots" | "state">(handle: () => {}) =>
  async (context: Context<A>) => {
    try {
      const a = await context.request.text();
      const b = parse();
    } catch {
    }
  };
