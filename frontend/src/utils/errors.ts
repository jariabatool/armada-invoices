import { ApiError } from "../api/http";

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError || error instanceof Error) return error.message || fallback;
  return fallback;
}

/** Turns API validation details into { field: message } for forms. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.details.map((detail) => [detail.field, detail.message]));
}
