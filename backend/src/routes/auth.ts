import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not set");

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const publicUser = { id: true, name: true, email: true, avatarUrl: true } as const;

export const authRouter = Router();

/**
 * POST /auth/google
 * Body: { credential: string } — the Google ID token from the frontend Sign-In button.
 * Verifies it with Google, upserts the user, and returns our own JWT.
 */
authRouter.post("/google", async (req, res) => {
  const credential: unknown = req.body?.credential;
  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({ error: "credential is required" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    return res.status(401).json({ error: "Google account email is not verified" });
  }

  const profile = {
    googleId: payload.sub,
    name: payload.name ?? payload.email,
    avatarUrl: payload.picture ?? null,
  };

  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: profile,
    create: { ...profile, email: payload.email },
    select: publicUser,
  });

  res.json({ token: signToken(user.id), user });
});

/** GET /auth/me — the logged-in user's profile */
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: publicUser });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});
