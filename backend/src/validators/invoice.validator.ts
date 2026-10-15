import { z } from "zod";
import { InvoiceStatus } from "../generated/prisma/client.js";

export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 10;

export const invoiceStatusSchema = z.enum(InvoiceStatus);

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  /** Accepts 1200 or "1200.50"; rounded to 2 decimals */
  amount: z.coerce
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(99_999_999.99, "Amount is too large")
    .transform((value) => Math.round(value * 100) / 100),
  dueDate: z.iso.date("Due date must be YYYY-MM-DD"),
  status: invoiceStatusSchema.default(InvoiceStatus.draft),
});

export const invoiceStatusUpdateSchema = z.object({
  status: invoiceStatusSchema,
});

export const invoiceListQuerySchema = z.object({
  status: z.enum([...Object.values(InvoiceStatus), "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
