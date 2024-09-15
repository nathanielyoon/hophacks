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
