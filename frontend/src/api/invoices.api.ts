import type { Paginated } from "../types/api";
import type { Invoice, InvoiceInput, InvoiceListParams, InvoiceStatus } from "../types/invoice";
import { request } from "./http";

export const invoicesApi = {
  list: ({ status, page, pageSize }: InvoiceListParams, signal?: AbortSignal) =>
    request<Paginated<Invoice>>("/invoices", { query: { status, page, pageSize }, signal }),

  get: (id: string, signal?: AbortSignal) => request<Invoice>(`/invoices/${id}`, { signal }),

  create: (input: InvoiceInput) => request<Invoice>("/invoices", { method: "POST", body: input }),

  update: (id: string, input: InvoiceInput) => request<Invoice>(`/invoices/${id}`, { method: "PUT", body: input }),

  updateStatus: (id: string, status: InvoiceStatus) =>
    request<Invoice>(`/invoices/${id}/status`, { method: "PATCH", body: { status } }),

  remove: (id: string) => request<void>(`/invoices/${id}`, { method: "DELETE" }),
};
