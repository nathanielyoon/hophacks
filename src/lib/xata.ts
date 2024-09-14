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

type QueryTable = {
  filter?: FilterExpression;
  sort?: SortExpression;
  page?: PageConfig;
  columns?: QueryColumnsProjection;
  /**
   * The consistency level for this request.
   *
   * @default strong
   */
  consistency?: "strong" | "eventual";
};

/**
 * @minProperties 1
 */
type FilterExpression = {
  $exists?: string;
  $existsNot?: string;
  $any?: FilterList;
  $all?: FilterList;
  $none?: FilterList;
  $not?: FilterList;
} & {
  [key: string]: FilterColumn;
};

type SortExpression = string[] | {
  [key: string]: SortOrder;
} | {
  [key: string]: SortOrder;
}[];

/**
 * Pagination settings.
 */
type PageConfig = {
  /**
   * Query the next page that follow the cursor.
   */
  after?: string;
  /**
   * Query the previous page before the cursor.
   */
  before?: string;
  /**
   * Query the first page from the cursor.
   */
  start?: string;
  /**
   * Query the last page from the cursor.
   */
  end?: string;
  /**
   * Set page size. If the size is missing it is read from the cursor. If no cursor is given Xata will choose the default page size.
   *
   * @default 20
   */
  size?: number;
  /**
   * Use offset to skip entries. To skip pages set offset to a multiple of size.
   *
   * @default 0
   */
  offset?: number;
};

type QueryColumnsProjection = (string | ProjectionConfig)[];

type FilterList = FilterExpression | FilterExpression[];

type FilterColumn = FilterColumnIncludes | FilterPredicate | FilterList;

type SortOrder = "asc" | "desc" | "random";

/**
 * A structured projection that allows for some configuration.
 */
type ProjectionConfig = {
  /**
   * The name of the column to project or a reverse link specification, see [API Guide](https://xata.io/docs/concepts/data-model#links-and-relations).
   */
  name?: string;
  columns?: QueryColumnsProjection;
  /**
   * An alias for the projected field, this is how it will be returned in the response.
   */
  as?: string;
  sort?: SortExpression;
  /**
   * @default 20
   */
  limit?: number;
  /**
   * @default 0
   */
  offset?: number;
};

/**
 * @maxProperties 1
 * @minProperties 1
 */
type FilterColumnIncludes = {
  $includes?: FilterPredicate;
  $includesAny?: FilterPredicate;
  $includesAll?: FilterPredicate;
  $includesNone?: FilterPredicate;
};

type FilterPredicate =
  | FilterValue
  | FilterPredicate[]
  | FilterPredicateOp
  | FilterPredicateRangeOp;

type FilterValue = number | string | boolean;

/**
 * @maxProperties 1
 * @minProperties 1
 */
type FilterPredicateOp = {
  $any?: FilterPredicate[];
  $all?: FilterPredicate[];
  $none?: FilterPredicate | FilterPredicate[];
  $not?: FilterPredicate | FilterPredicate[];
  $is?: FilterValue | FilterValue[];
  $isNot?: FilterValue | FilterValue[];
  $lt?: FilterRangeValue;
  $le?: FilterRangeValue;
  $gt?: FilterRangeValue;
  $ge?: FilterRangeValue;
  $contains?: string;
  $iContains?: string;
  $startsWith?: string;
  $endsWith?: string;
  $pattern?: string;
  $iPattern?: string;
};

/**
 * @maxProperties 2
 * @minProperties 2
 */
type FilterPredicateRangeOp = {
  $lt?: FilterRangeValue;
  $le?: FilterRangeValue;
  $gt?: FilterRangeValue;
  $ge?: FilterRangeValue;
};

type FilterRangeValue = number | string;

type InsertRecord = DataInputRecord;

/**
 * Xata input record
 */
type DataInputRecord = {
  [key: string]:
    | RecordID
    | string
    | boolean
    | number
    | string[]
    | number[]
    | DateTime
    | ObjectValue
    | InputFileArray
    | InputFile
    | null;
};

/**
 * @maxLength 255
 * @minLength 1
 * @pattern [a-zA-Z0-9_-~:]+
 */
type RecordID = string;

/**
 * @format date-time
 */
type DateTime = string;

/**
 * Object column value
 */
type ObjectValue = {
  [key: string]:
    | string
    | boolean
    | number
    | string[]
    | number[]
    | DateTime
    | ObjectValue;
};

/**
 * Array of file entries
 *
 * @maxItems 50
 */
type InputFileArray = InputFileEntry[];

/**
 * Object representing a file
 */
type InputFile = {
  name: FileName;
  mediaType?: MediaType;
  /**
   * Base64 encoded content
   *
   * @maxLength 20971520
   */
  base64Content?: string;
  /**
   * Enable public access to the file
   */
  enablePublicUrl?: boolean;
  /**
   * Time to live for signed URLs
   */
  signedUrlTimeout?: number;
  /**
   * Time to live for upload URLs
   */
  uploadUrlTimeout?: number;
};

/**
 * Object representing a file in an array
 */
type InputFileEntry = {
  id?: FileItemID;
  name?: FileName;
  mediaType?: MediaType;
  /**
   * Base64 encoded content
   *
   * @maxLength 20971520
   */
  base64Content?: string;
  /**
   * Enable public access to the file
   */
  enablePublicUrl?: boolean;
  /**
   * Time to live for signed URLs
   */
  signedUrlTimeout?: number;
  /**
   * Time to live for upload URLs
   */
  uploadUrlTimeout?: number;
};

/**
 * File name
 *
 * @maxLength 1024
 * @minLength 0
 * @pattern [0-9a-zA-Z!\-_\.\*'\(\)]*
 */
type FileName = string;

/**
 * Media type
 *
 * @maxLength 255
 * @minLength 3
 * @pattern ^\w+/[-+.\w]+$
 */
type MediaType = string;

/**
 * Unique file identifier
 *
 * @maxLength 255
 * @minLength 1
 * @pattern [a-zA-Z0-9_-~:]+
 */
type FileItemID = string;
