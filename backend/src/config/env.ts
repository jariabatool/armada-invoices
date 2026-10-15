import "dotenv/config";
import { z } from "zod";

/**
 * All environment variables are validated once at startup,
 * so a missing or malformed value fails fast with a clear message.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  /** Comma-separated list of allowed CORS origins. Empty = allow all (local dev only). */
  FRONTEND_URL: z.string().optional(),
  /** Cron expression (UTC) for the overdue-invoice job, or "off". */
  OVERDUE_CRON: z.string().default("0 * * * *"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`Invalid environment configuration:\n${problems}`);
  process.exit(1);
}

const { FRONTEND_URL, ...rest } = parsed.data;

export const env = {
  ...rest,
  corsOrigins: FRONTEND_URL
    ? FRONTEND_URL.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : null,
} as const;
