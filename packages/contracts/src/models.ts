import { z } from "zod";

export const ModelType = z.enum(["image", "video"]);
export type ModelType = z.infer<typeof ModelType>;

export const InputKind = z.enum(["image", "video", "audio"]);
export type InputKind = z.infer<typeof InputKind>;

export const ModelCapabilities = z.object({
  supportsPrompt: z.boolean(),
  requiresInputs: z.array(InputKind).default([]),
});
export type ModelCapabilities = z.infer<typeof ModelCapabilities>;

export const ModelParams = z.object({
  sizes: z.array(z.string()),
  ratios: z.array(z.string()),
  maxCount: z.number().int().min(1).max(4),
});
export type ModelParams = z.infer<typeof ModelParams>;

export const ModelInfo = z.object({
  modelKey: z.string(),
  name: z.string(),
  type: ModelType,
  desc: z.string(),
  tag: z.string().optional(),
  price: z.number().min(0),
  capabilities: ModelCapabilities,
  params: ModelParams,
});
export type ModelInfo = z.infer<typeof ModelInfo>;
