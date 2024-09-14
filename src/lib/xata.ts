import { Errer } from "./error.ts";
import { Data, Form, parse } from "./form.ts";
import { Json, safe } from "./input.ts";

export const POINT = {
  start: { type: "date" },
  end: { type: "date" },
  latitude: { type: "number", step: "any", min: -90, max: 90 },
  longitude: { type: "number", step: "any", min: -180, max: 180 },
} satisfies Form;
export type Point = Data<typeof POINT>;
class ClientErrorError
  extends Errer<{ status: number; id?: string; message: string }> {}
class APIKeyError extends Errer<{ api_key: string }> {}
class UnknownStatusError extends Errer<{ status: number; text: string }> {}
class ServerErrorError extends Errer<{ status: number }> {}
class ResponseError extends Errer<{ text: string; why: string }> {}
const PATHS = { INSERT: "data", SELECT: "query" };
export class Xata {
  constructor(private table_url: string, private api_key: string) {}
  private async error(response: Response) {
    const status = response.status;
    switch (status) {
      case 401:
        throw new APIKeyError({ api_key: this.api_key });
      case 400:
      case 404:
        throw new ClientErrorError(await response.json());
      default:
        if ((status / 100 | 0) === 5) throw new ServerErrorError({ status });
        throw new UnknownStatusError({ status, text: await response.text() });
    }
  }
  post(path: "INSERT", body: QueryTable): Promise<void>;
  post(path: "SELECT", body: InsertRecord): Promise<Point[]>;
  async post(action: keyof typeof PATHS, body: QueryTable | InsertRecord) {
    const response = await fetch(`${this.table_url}/${PATHS[action]}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.api_key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      const text = await response.text();
      const json = safe<{ records: { [_: string]: Json }[] }>(text);
      const type = typeof json;
      if (type !== "object") throw new ResponseError({ text, why: type });
      if (json === null) throw new ResponseError({ text, why: "null" });
      if (Array.isArray(json)) throw new ResponseError({ text, why: "array" });
      const records = json.records;
      if (!records) throw new ResponseError({ text, why: "no records" });
      const points = Array<Point>(records.length);
      for (let z = 0; z < records.length; ++z) {
        points[z] = parse(POINT, records[z]);
      }
      return points;
    } else if (response.status !== 201) return this.error(response);
  }
}
