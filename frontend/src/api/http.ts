import { env } from "../config/env";
import type { FieldError } from "../types/api";
import { tokenStorage } from "./token-storage";

export class ApiError extends Error {
  readonly status: number;
  readonly details: FieldError[];

  constructor(status: number, message: string, details: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Subscribe to 401 responses (used by the auth provider to log the user out). */
export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${env.apiUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** JSON fetch wrapper: attaches the JWT and throws ApiError on any non-2xx response. */
export async function request<T>(path: string, { method = "GET", body, query, signal }: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const payload = (data ?? {}) as { error?: string; details?: FieldError[] };
    if (response.status === 401 && token) unauthorizedListeners.forEach((listener) => listener());
    throw new ApiError(response.status, payload.error ?? `Request failed (${response.status})`, payload.details);
  }

  return data as T;
}
