export abstract class Errer<A = unknown> extends Error {
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
