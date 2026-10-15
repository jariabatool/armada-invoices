import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { clientsRouter } from "./clients.routes.js";
import { invoicesRouter } from "./invoices.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/clients", clientsRouter);
apiRouter.use("/invoices", invoicesRouter);
