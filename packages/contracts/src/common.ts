import { z } from "zod";

export const ApiErrorEnvelope = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
  details: z.unknown().optional(),
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelope>;
