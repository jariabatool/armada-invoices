import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors(env.corsOrigins ? { origin: env.corsOrigins } : {}));
  app.use(express.json({ limit: "100kb" }));

  app.use(apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
