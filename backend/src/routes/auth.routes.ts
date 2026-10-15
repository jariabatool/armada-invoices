import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/google", authController.googleLogin);
authRouter.get("/me", requireAuth, authController.getMe);
