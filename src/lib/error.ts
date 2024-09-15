export abstract class Errer<A = unknown> extends Error {
  static json(error: unknown) {
    if (error instanceof Errer) return JSON.stringify(error.toJSON());
    if (error instanceof Error) {
      return JSON.stringify({
        message: `${error}`,
        stack: error.stack,
        cause: error.cause,
      });
    }
    throw error;
  }
  declare cause: A;
  constructor(message: string, cause: A);
  constructor(cause: A);
  constructor(message: string | A, cause?: A) {
    super();
    if (cause === undefined) this.cause = <A> message;
    else this.message = <string> message, this.cause = cause;
  }
  toJSON() {
    return {
      name: this.constructor.name,
      stack: this.stack,
      message: this.message,
      cause: this.cause,
    };
  }
}
export class UnreachableError
  extends Errer<{ [_: string]: unknown } | undefined> {
  constructor(cause?: { [_: string]: unknown }) {
    super(cause);
  }
}
