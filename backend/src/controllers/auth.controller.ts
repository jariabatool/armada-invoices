import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { getUserId } from "../middleware/auth.middleware.js";
import { googleLoginSchema } from "../validators/auth.validator.js";

/** POST /auth/google — body: { credential } (Google ID token) */
export async function googleLogin(req: Request, res: Response) {
  const { credential } = googleLoginSchema.parse(req.body);
  res.json(await authService.loginWithGoogle(credential));
}

/** GET /auth/me */
export async function getMe(req: Request, res: Response) {
  res.json({ user: await authService.getUserProfile(getUserId(req)) });
}
