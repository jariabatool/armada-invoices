import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { authRouter } from "./routes/auth.js";
import { clientsRouter } from "./routes/clients.js";
import { invoicesRouter } from "./routes/invoices.js";
import { HttpError } from "./lib/http.js";

const app = express();

// FRONTEND_URL can be a comma-separated list; unset = allow all (local dev)
const allowedOrigins = process.env.FRONTEND_URL?.split(",").map((o) => o.trim());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRouter);
app.use("/clients", clientsRouter);
app.use("/invoices", invoicesRouter);

// 404 for unknown routes
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler (Express 5 forwards async errors here)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
