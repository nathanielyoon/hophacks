import { Errer, UnreachableError } from "./error.ts";
import { Data, Form, parse } from "./form.ts";
import { Json, safe } from "./input.ts";

class ClientErrorError
  extends Errer<{ status: number; id?: string; message: string }> {}
class APIKeyError extends Errer<{ api_key: string }> {}
class UnknownStatusError extends Errer<{ status: number; text: string }> {}
class ServerErrorError extends Errer<{ status: number }> {}
class ResponseError extends Errer<{ text: string; why: string }> {}
export class Xata {
  constructor(private api_key: string, private table_url: string) {}
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
  post(body: InsertRecord): Promise<void>;
  post<A extends Form>(body: QueryTable, form: A): Promise<Data<A>[]>;
  async post(body: QueryTable | InsertRecord, form?: Form) {
    const url = `${this.table_url}/${form ? "query" : "data"}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.api_key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      if (!form) throw new UnreachableError();
      const text = await response.text();
      const json = safe<{ records: { [_: string]: Json }[] }>(text);
      const type = typeof json;
      if (type !== "object") throw new ResponseError({ text, why: type });
      if (json === null) throw new ResponseError({ text, why: "null" });
      if (Array.isArray(json)) throw new ResponseError({ text, why: "array" });
      const records = json.records;
      if (!records) throw new ResponseError({ text, why: "no records" });
      const points = Array<Data<Form>>(records.length);
      for (let z = 0; z < records.length; ++z) {
        points[z] = parse(form!, records[z]);
      }
      return points;
    } else if (response.status !== 201) return this.error(response);
  }
}
