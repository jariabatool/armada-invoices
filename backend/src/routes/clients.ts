import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { notFound } from "../lib/http.js";
import { requireAuth } from "../middleware/requireAuth.js";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  // Optional: missing or empty string is stored as null
  company: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => v || null),
});

export const clientsRouter = Router();
clientsRouter.use(requireAuth);

/** Loads a client only if it belongs to the logged-in user, else 404. */
async function findOwnedClient(id: string, userId: string) {
  const client = await prisma.client.findFirst({ where: { id, userId } });
  if (!client) throw notFound("Client");
  return client;
}

/** GET /clients — all of the user's clients, newest first, with invoice counts */
clientsRouter.get("/", async (req, res) => {
  const clients = await prisma.client.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  });
  res.json({ items: clients });
});

/** GET /clients/:id */
clientsRouter.get("/:id", async (req, res) => {
  res.json(await findOwnedClient(req.params.id, req.userId!));
});

/** POST /clients — body: { name, email, company? } */
clientsRouter.post("/", async (req, res) => {
  const data = clientSchema.parse(req.body);
  const client = await prisma.client.create({ data: { ...data, userId: req.userId! } });
  res.status(201).json(client);
});

/** PUT /clients/:id — body: { name, email, company? } */
clientsRouter.put("/:id", async (req, res) => {
  const data = clientSchema.parse(req.body);
  await findOwnedClient(req.params.id, req.userId!);
  const client = await prisma.client.update({ where: { id: req.params.id }, data });
  res.json(client);
});

/** DELETE /clients/:id — also deletes the client's invoices (cascade) */
clientsRouter.delete("/:id", async (req, res) => {
  await findOwnedClient(req.params.id, req.userId!);
  await prisma.client.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
