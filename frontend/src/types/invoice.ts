export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type InvoiceStatusFilter = InvoiceStatus | "all";

export interface Invoice {
  id: string;
  clientId: string;
  title: string;
  amount: number;
  /** Calendar date, YYYY-MM-DD */
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; company: string | null };
}

export interface InvoiceInput {
  clientId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface InvoiceListParams {
  status: InvoiceStatusFilter;
  page: number;
  pageSize: number;
}
