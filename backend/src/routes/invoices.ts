import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { notFound } from "../lib/http.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { InvoiceStatus, type Prisma } from "../generated/prisma/client.js";

const statusSchema = z.enum(InvoiceStatus);

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().trim().min(1, "Title is required").max(200),
  // Accepts 1200 or "1200.50"; stored with 2 decimals
  amount: z.coerce
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(99_999_999.99)
    .transform((v) => Math.round(v * 100) / 100),
  dueDate: z.iso.date("Due date must be YYYY-MM-DD"),
  status: statusSchema.default(InvoiceStatus.draft),
});

const listQuerySchema = z.object({
  status: z.enum([...Object.values(InvoiceStatus), "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const includeClient = { client: { select: { id: true, name: true, company: true } } } as const;
type InvoiceWithClient = Prisma.InvoiceGetPayload<{ include: typeof includeClient }>;

/** API shape: amount as a number, dueDate as a plain YYYY-MM-DD string. */
const toDto = (inv: InvoiceWithClient) => ({
  ...inv,
  amount: inv.amount.toNumber(),
  dueDate: inv.dueDate.toISOString().slice(0, 10),
});

const toDate = (isoDate: string) => new Date(`${isoDate}T00:00:00.000Z`);

export const invoicesRouter = Router();
invoicesRouter.use(requireAuth);

/** Invoices are owned through their client: client.userId must be the logged-in user. */
async function findOwnedInvoice(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id, client: { userId } }, include: includeClient });
  if (!invoice) throw notFound("Invoice");
  return invoice;
}

async function assertOwnedClient(clientId: string, userId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, userId }, select: { id: true } });
  if (!client) throw notFound("Client");
}

/** GET /invoices?status=draft|sent|paid|overdue|all&page=1&pageSize=10 */
invoicesRouter.get("/", async (req, res) => {
  const { status, page, pageSize } = listQuerySchema.parse(req.query);
  const where: Prisma.InvoiceWhereInput = {
    client: { userId: req.userId! },
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

  res.json({
    items: items.map(toDto),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

/** GET /invoices/:id */
invoicesRouter.get("/:id", async (req, res) => {
  res.json(toDto(await findOwnedInvoice(req.params.id, req.userId!)));
});

/** POST /invoices — body: { clientId, title, amount, dueDate, status? } */
invoicesRouter.post("/", async (req, res) => {
  const { dueDate, ...data } = invoiceSchema.parse(req.body);
  await assertOwnedClient(data.clientId, req.userId!);
  const invoice = await prisma.invoice.create({
    data: { ...data, dueDate: toDate(dueDate) },
    include: includeClient,
  });
  res.status(201).json(toDto(invoice));
});

/** PUT /invoices/:id — full update (same body as create) */
invoicesRouter.put("/:id", async (req, res) => {
  const { dueDate, ...data } = invoiceSchema.parse(req.body);
  await findOwnedInvoice(req.params.id, req.userId!);
  await assertOwnedClient(data.clientId, req.userId!); // client may be changed
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { ...data, dueDate: toDate(dueDate) },
    include: includeClient,
  });
  res.json(toDto(invoice));
});

/** PATCH /invoices/:id/status — body: { status } */
invoicesRouter.patch("/:id/status", async (req, res) => {
  const { status } = z.object({ status: statusSchema }).parse(req.body);
  await findOwnedInvoice(req.params.id, req.userId!);
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status },
    include: includeClient,
  });
  res.json(toDto(invoice));
});

/** DELETE /invoices/:id */
invoicesRouter.delete("/:id", async (req, res) => {
  await findOwnedInvoice(req.params.id, req.userId!);
  await prisma.invoice.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
