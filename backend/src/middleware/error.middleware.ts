import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { InvoiceRuleError } from "../domain/invoice-status.js";
import { HttpError } from "../utils/http-error.js";

/** 404 for any route that did not match. */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

/** Central error handler. Express 5 forwards thrown and rejected errors here. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  // A business rule was broken (e.g. an invalid status change)
  if (err instanceof InvoiceRuleError) {
    res.status(422).json({ error: err.message });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Malformed JSON request body (thrown by express.json())
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
