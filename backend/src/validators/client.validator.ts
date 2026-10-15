import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  /** Optional: missing or empty string is stored as null */
  company: z
    .string()
    .trim()
    .max(100, "Company is too long")
    .optional()
    .transform((value) => value || null),
});

export type ClientInput = z.infer<typeof clientSchema>;
