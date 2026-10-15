import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { notFound, unauthorized } from "../utils/http-error.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/** Fields of a user that are safe to send to the client. */
const publicUserSelect = { id: true, name: true, email: true, avatarUrl: true } as const;

/**
 * Verifies a Google ID token, creates or updates the matching user,
 * and returns our own JWT plus the user's public profile.
 */
export async function loginWithGoogle(credential: string) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw unauthorized("Invalid Google credential");
  }

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw unauthorized("Google account email is not verified");
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
    select: publicUserSelect,
  });

  return { token: signToken(user.id), user };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw notFound("User");
  return user;
}
