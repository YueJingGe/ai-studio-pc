import { z } from "zod";

export const AssetType = z.enum(["image", "video", "audio"]);
export type AssetType = z.infer<typeof AssetType>;

export const AssetView = z.object({
  id: z.string(),
  type: AssetType,
  url: z.string(),
  taskId: z.string(),
  modelKey: z.string(),
  createdAt: z.number(),
});
export type AssetView = z.infer<typeof AssetView>;

export const AssetListQuery = z.object({ type: AssetType.optional() });
export type AssetListQuery = z.infer<typeof AssetListQuery>;
