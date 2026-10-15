import type { Request, Response } from "express";
import * as invoicesService from "../services/invoices.service.js";
import { getUserId } from "../middleware/auth.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  invoiceListQuerySchema,
  invoiceSchema,
  invoiceStatusUpdateSchema,
} from "../validators/invoice.validator.js";

/** GET /invoices?status=all|draft|sent|paid|overdue&page=1&pageSize=10 */
export async function listInvoices(req: Request, res: Response) {
  const query = invoiceListQuerySchema.parse(req.query);
  res.json(await invoicesService.listInvoices(getUserId(req), query));
}

/** GET /invoices/:id */
export async function getInvoice(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await invoicesService.getInvoice(getUserId(req), id));
}

/** POST /invoices */
export async function createInvoice(req: Request, res: Response) {
  const input = invoiceSchema.parse(req.body);
  res.status(201).json(await invoicesService.createInvoice(getUserId(req), input));
}

/** PUT /invoices/:id */
export async function updateInvoice(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = invoiceSchema.parse(req.body);
  res.json(await invoicesService.updateInvoice(getUserId(req), id, input));
}

/** PATCH /invoices/:id/status */
export async function updateInvoiceStatus(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { status } = invoiceStatusUpdateSchema.parse(req.body);
  res.json(await invoicesService.updateInvoiceStatus(getUserId(req), id, status));
}

/** DELETE /invoices/:id */
export async function deleteInvoice(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await invoicesService.deleteInvoice(getUserId(req), id);
  res.status(204).end();
}
