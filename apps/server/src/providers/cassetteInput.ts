import type { CreateTaskInput } from "@ai-studio/contracts";

/** 固定输入：录制与回放哈希必须一致（ADR-004） */
export const CASSETTE_INPUT: CreateTaskInput & { taskId: string } = {
  taskId: "cassette-fixed-task",
  modelKey: "qwen-image",
  prompt: "cassette cat, studio light",
  params: { size: "1K", ratio: "1:1", count: 1 },
  refImages: [],
};
