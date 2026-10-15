import { InvoiceStatus } from "../generated/prisma/enums.js";
import { formatIsoDate, startOfUtcDay } from "../utils/date.js";

/**
 * Invoice lifecycle rules. The single source of truth for which status
 * changes are allowed and how the due date affects the status.
 *
 *   draft   → sent
 *   sent    → paid, overdue, draft
 *   overdue → paid, sent
 *   paid    → (final: locked)
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<InvoiceStatus, readonly InvoiceStatus[]>> = {
  draft: [InvoiceStatus.sent],
  sent: [InvoiceStatus.paid, InvoiceStatus.overdue, InvoiceStatus.draft],
  overdue: [InvoiceStatus.paid, InvoiceStatus.sent],
  paid: [],
};

/**
 * Statuses a new invoice may be created with. "paid" records an invoice that was already paid;
 * "overdue" is never chosen directly (a sent invoice with a past due date becomes overdue).
 */
export const INITIAL_STATUSES: readonly InvoiceStatus[] = [InvoiceStatus.draft, InvoiceStatus.sent, InvoiceStatus.paid];

/** Why a status rule was broken. Mapped to a 422 response by the service layer. */
export class InvoiceRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceRuleError";
  }
}

/** True when the due date is before today (UTC calendar day). */
export function isPastDue(dueDate: Date, now: Date = new Date()): boolean {
  return dueDate < startOfUtcDay(now);
}

export function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return from === to || ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Applies the due-date rules to a requested status and returns the status to store:
 *  - "overdue" needs a due date in the past
 *  - "sent" with a past due date is stored as "overdue"
 *  - an overdue invoice whose due date moves into the future goes back to "sent"
 *
 * @param current the invoice's current status, or null when creating
 */
export function resolveStatus(
  requested: InvoiceStatus,
  dueDate: Date,
  current: InvoiceStatus | null,
  now: Date = new Date(),
): InvoiceStatus {
  const pastDue = isPastDue(dueDate, now);

  if (requested === InvoiceStatus.overdue && !pastDue) {
    // Editing an overdue invoice and moving its due date forward re-opens it as "sent"
    if (current === InvoiceStatus.overdue) return InvoiceStatus.sent;
    throw new InvoiceRuleError(
      `An invoice can only be overdue after its due date has passed (due ${formatIsoDate(dueDate)}).`,
    );
  }

  if (requested === InvoiceStatus.sent && pastDue) {
    if (current === InvoiceStatus.overdue) {
      throw new InvoiceRuleError("This invoice's due date has passed. Move the due date forward to mark it as sent.");
    }
    return InvoiceStatus.overdue;
  }

  return requested;
}

/** Validates the status for a new invoice and returns the status to store. */
export function statusForNewInvoice(requested: InvoiceStatus, dueDate: Date, now: Date = new Date()): InvoiceStatus {
  if (!INITIAL_STATUSES.includes(requested)) {
    throw new InvoiceRuleError(`New invoices must be created as draft, sent or paid, not ${requested}.`);
  }
  return resolveStatus(requested, dueDate, null, now);
}

/** Validates a status change on an existing invoice and returns the status to store. */
export function statusForUpdate(
  current: InvoiceStatus,
  requested: InvoiceStatus,
  dueDate: Date,
  now: Date = new Date(),
): InvoiceStatus {
  if (current === InvoiceStatus.paid) {
    throw new InvoiceRuleError("Paid invoices are locked and can't be changed.");
  }
  if (!canTransition(current, requested)) {
    throw new InvoiceRuleError(`An invoice can't go from ${current} to ${requested}.`);
  }
  return resolveStatus(requested, dueDate, current, now);
}
