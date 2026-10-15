import { prisma } from "../lib/prisma.js";
import { notFound } from "../utils/http-error.js";
import type { ClientInput } from "../validators/client.validator.js";

/** Loads a client only if it belongs to the user; otherwise 404 (never reveals other users' data). */
async function findOwnedClientOrThrow(userId: string, clientId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
  if (!client) throw notFound("Client");
  return client;
}

export async function assertClientOwnership(userId: string, clientId: string): Promise<void> {
  await findOwnedClientOrThrow(userId, clientId);
}

export function listClients(userId: string) {
  return prisma.client.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  });
}

export function getClient(userId: string, clientId: string) {
  return findOwnedClientOrThrow(userId, clientId);
}

export function createClient(userId: string, input: ClientInput) {
  return prisma.client.create({ data: { ...input, userId } });
}

export async function updateClient(userId: string, clientId: string, input: ClientInput) {
  await findOwnedClientOrThrow(userId, clientId);
  return prisma.client.update({ where: { id: clientId }, data: input });
}

/** Deleting a client also deletes its invoices (ON DELETE CASCADE). */
export async function deleteClient(userId: string, clientId: string): Promise<void> {
  await findOwnedClientOrThrow(userId, clientId);
  await prisma.client.delete({ where: { id: clientId } });
}
