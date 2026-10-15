import { Router } from "express";
import * as clientsController from "../controllers/clients.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const clientsRouter = Router();

clientsRouter.use(requireAuth);

clientsRouter.get("/", clientsController.listClients);
clientsRouter.post("/", clientsController.createClient);
clientsRouter.get("/:id", clientsController.getClient);
clientsRouter.put("/:id", clientsController.updateClient);
clientsRouter.delete("/:id", clientsController.deleteClient);
