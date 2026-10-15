import { z } from "zod";

export const googleLoginSchema = z.object({
  credential: z.string().min(1, "credential is required"),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
