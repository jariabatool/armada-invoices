import { prisma } from "../lib/prisma.js";
import { InvoiceStatus, type Prisma } from "../generated/prisma/client.js";
import { formatIsoDate, parseIsoDate, startOfUtcDay } from "../utils/date.js";
import { notFound } from "../utils/http-error.js";
import { assertClientOwnership } from "./clients.service.js";
import type { InvoiceInput, InvoiceListQuery } from "../validators/invoice.validator.js";

const includeClient = { client: { select: { id: true, name: true, company: true } } } as const;
type InvoiceWithClient = Prisma.InvoiceGetPayload<{ include: typeof includeClient }>;

/** API shape: amount as a number, dueDate as a plain YYYY-MM-DD string. */
function toInvoiceDto(invoice: InvoiceWithClient) {
  return {
    ...invoice,
    amount: invoice.amount.toNumber(),
    dueDate: formatIsoDate(invoice.dueDate),
  };
}

export type InvoiceDto = ReturnType<typeof toInvoiceDto>;

/** Invoices are owned through their client: client.userId must match. */
async function findOwnedInvoiceOrThrow(userId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, client: { userId } },
    include: includeClient,
  });
  if (!invoice) throw notFound("Invoice");
  return invoice;
}

export async function listInvoices(userId: string, { status, page, pageSize }: InvoiceListQuery) {
  const where: Prisma.InvoiceWhereInput = {
    client: { userId },
    ...(status !== "all" && { status }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      include: includeClient,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    items: items.map(toInvoiceDto),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getInvoice(userId: string, invoiceId: string): Promise<InvoiceDto> {
  return toInvoiceDto(await findOwnedInvoiceOrThrow(userId, invoiceId));
}

export async function createInvoice(userId: string, { dueDate, ...input }: InvoiceInput): Promise<InvoiceDto> {
  await assertClientOwnership(userId, input.clientId);
  const invoice = await prisma.invoice.create({
    data: { ...input, dueDate: parseIsoDate(dueDate) },
    include: includeClient,
  });
  return toInvoiceDto(invoice);
}

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  { dueDate, ...input }: InvoiceInput,
): Promise<InvoiceDto> {
  await findOwnedInvoiceOrThrow(userId, invoiceId);
  await assertClientOwnership(userId, input.clientId); // the client may be changed
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { ...input, dueDate: parseIsoDate(dueDate) },
    include: includeClient,
  });
  return toInvoiceDto(invoice);
}

export async function updateInvoiceStatus(
  userId: string,
  invoiceId: string,
  status: InvoiceStatus,
): Promise<InvoiceDto> {
  await findOwnedInvoiceOrThrow(userId, invoiceId);
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
    include: includeClient,
  });
  return toInvoiceDto(invoice);
}

export async function deleteInvoice(userId: string, invoiceId: string): Promise<void> {
  await findOwnedInvoiceOrThrow(userId, invoiceId);
  await prisma.invoice.delete({ where: { id: invoiceId } });
}

/**
 * Marks every `sent` invoice whose due date is before today (UTC) as `overdue`.
 * Returns the affected invoices so the caller can log reminders.
 */
export async function markOverdueInvoices(now: Date = new Date()) {
  const where = { status: InvoiceStatus.sent, dueDate: { lt: startOfUtcDay(now) } };

  const due = await prisma.invoice.findMany({
    where,
    select: {
      id: true,
      title: true,
      amount: true,
      dueDate: true,
      client: { select: { name: true, email: true } },
    },
  });
  if (due.length === 0) return [];

  // Re-check the status in the update in case an invoice changed in between
  await prisma.invoice.updateMany({
    where: { ...where, id: { in: due.map((invoice) => invoice.id) } },
    data: { status: InvoiceStatus.overdue },
  });

  return due;
}
