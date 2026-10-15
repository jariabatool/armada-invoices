import { z } from "zod";

/** Route params containing a record id. */
export const idParamSchema = z.object({
  id: z.string().min(1),
});
