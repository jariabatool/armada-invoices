import { Router } from "express";
import * as invoicesController from "../controllers/invoices.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const invoicesRouter = Router();

invoicesRouter.use(requireAuth);

invoicesRouter.get("/", invoicesController.listInvoices);
invoicesRouter.post("/", invoicesController.createInvoice);
invoicesRouter.get("/:id", invoicesController.getInvoice);
invoicesRouter.put("/:id", invoicesController.updateInvoice);
invoicesRouter.patch("/:id/status", invoicesController.updateInvoiceStatus);
invoicesRouter.delete("/:id", invoicesController.deleteInvoice);
