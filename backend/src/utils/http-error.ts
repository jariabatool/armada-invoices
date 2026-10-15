/**
 * An error with an HTTP status. Throw it from anywhere in a request;
 * the error middleware turns it into a JSON response.
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const unauthorized = (message = "Unauthorized") => new HttpError(401, message);
export const notFound = (resource: string) => new HttpError(404, `${resource} not found`);
