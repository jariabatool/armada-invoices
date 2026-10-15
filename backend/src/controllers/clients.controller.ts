import type { Request, Response } from "express";
import * as clientsService from "../services/clients.service.js";
import { getUserId } from "../middleware/auth.middleware.js";
import { clientSchema } from "../validators/client.validator.js";
import { idParamSchema } from "../validators/common.validator.js";

/** GET /clients */
export async function listClients(req: Request, res: Response) {
  res.json({ items: await clientsService.listClients(getUserId(req)) });
}

/** GET /clients/:id */
export async function getClient(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await clientsService.getClient(getUserId(req), id));
}

/** POST /clients */
export async function createClient(req: Request, res: Response) {
  const input = clientSchema.parse(req.body);
  res.status(201).json(await clientsService.createClient(getUserId(req), input));
}

/** PUT /clients/:id */
export async function updateClient(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = clientSchema.parse(req.body);
  res.json(await clientsService.updateClient(getUserId(req), id, input));
}

/** DELETE /clients/:id */
export async function deleteClient(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await clientsService.deleteClient(getUserId(req), id);
  res.status(204).end();
}
