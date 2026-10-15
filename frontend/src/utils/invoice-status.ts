import type { InvoiceStatus } from "../types/invoice";

/**
 * Mirrors the backend lifecycle rules (backend/src/domain/invoice-status.ts)
 * so the UI only offers valid choices. The API remains the source of truth.
 *
 *   draft → sent · sent → paid/overdue/draft · overdue → paid/sent · paid → locked
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<InvoiceStatus, readonly InvoiceStatus[]>> = {
  draft: ["sent"],
  sent: ["paid", "overdue", "draft"],
  overdue: ["paid", "sent"],
  paid: [],
};

/** Statuses a new invoice can be created with ("paid" records an invoice that was already paid). */
export const INITIAL_STATUSES: readonly InvoiceStatus[] = ["draft", "sent", "paid"];

export const isLocked = (status: InvoiceStatus): boolean => status === "paid";

/** Today's UTC calendar date as YYYY-MM-DD (the backend compares due dates in UTC). */
const todayUtcIsoDate = (): string => new Date().toISOString().slice(0, 10);

/** True when the YYYY-MM-DD due date is before today. */
export const isPastDue = (dueDate: string): boolean => dueDate < todayUtcIsoDate();

/** Statuses to offer for an existing invoice: its current one plus valid next steps for its due date. */
export function getStatusOptions(current: InvoiceStatus, dueDate: string): InvoiceStatus[] {
  const pastDue = isPastDue(dueDate);
  const next = ALLOWED_TRANSITIONS[current].filter((status) => {
    if (status === "overdue") return pastDue;
    if (status === "sent" && current === "overdue") return !pastDue;
    return true;
  });
  return [current, ...next];
}

export type StatusResolution = { ok: true; status: InvoiceStatus } | { ok: false; error: string };

/**
 * Predicts the status the API will store, or why it will be rejected.
 * @param current the invoice's current status, or null for a new invoice
 */
export function resolveStatus(
  requested: InvoiceStatus,
  dueDate: string,
  current: InvoiceStatus | null,
): StatusResolution {
  if (current && current !== requested && !ALLOWED_TRANSITIONS[current].includes(requested)) {
    return { ok: false, error: `An invoice can't go from ${current} to ${requested}.` };
  }
  if (!dueDate) return { ok: true, status: requested };

  const pastDue = isPastDue(dueDate);
  if (requested === "overdue" && !pastDue) {
    return current === "overdue"
      ? { ok: true, status: "sent" }
      : { ok: false, error: "Overdue is only possible after the due date has passed." };
  }
  if (requested === "sent" && pastDue) {
    return current === "overdue"
      ? { ok: false, error: "The due date has passed. Move it forward to mark the invoice as sent." }
      : { ok: true, status: "overdue" };
  }
  return { ok: true, status: requested };
}
