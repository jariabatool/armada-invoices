import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const { sub } = verifyToken(header.slice("Bearer ".length));
    req.userId = sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
