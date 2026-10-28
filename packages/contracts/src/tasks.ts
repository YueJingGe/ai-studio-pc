import { z } from "zod";

export const TaskStatus = z.enum(["pending", "running", "succeeded", "failed", "canceled"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TERMINAL_STATUSES: readonly TaskStatus[] = ["succeeded", "failed", "canceled"];

export const TaskParams = z.object({
  size: z.string(),
  ratio: z.string(),
  count: z.number().int().min(1).max(4),
});
export type TaskParams = z.infer<typeof TaskParams>;

export const CreateTaskInput = z.object({
  modelKey: z.string().min(1),
  /** 提示词；与参考图至少提供一项（支持仅图输入编辑） */
  prompt: z.string().max(2000).optional(),
  params: TaskParams,
  refImages: z.array(z.string()).max(4).optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInput>;

export const TaskView = z.object({
  id: z.string(),
  modelKey: z.string(),
  status: TaskStatus,
  prompt: z.string(),
  params: TaskParams,
  refImages: z.array(z.string()),
  outputs: z.array(z.string()),
  credit: z.number(),
  error: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type TaskView = z.infer<typeof TaskView>;
