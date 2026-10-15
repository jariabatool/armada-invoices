import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import { unauthorized } from "../utils/http-error.js";

const BEARER_PREFIX = "Bearer ";

/** Requires a valid `Authorization: Bearer <jwt>` header and sets `req.userId`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw unauthorized("Missing or invalid Authorization header");
  }

  try {
    req.userId = verifyToken(header.slice(BEARER_PREFIX.length)).sub;
  } catch {
    throw unauthorized("Invalid or expired token");
  }
  next();
}

/** For handlers behind requireAuth: returns the authenticated user id. */
export function getUserId(req: Request): string {
  if (!req.userId) throw unauthorized();
  return req.userId;
}
