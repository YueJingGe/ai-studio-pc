export const MOCK_MODEL = {
  modelKey: "qwen-image-mock",
  name: "Qwen-Image 3.0（Mock）",
  type: "image",
  desc: "测试模型",
  tag: "New",
  price: 1,
  capabilities: { supportsPrompt: true, requiresInputs: [] },
  params: { sizes: ["1K", "2K"], ratios: ["原始", "1:1"], maxCount: 4 },
} as const;

export function makeTask(overrides: Partial<{ prompt: string; status: string }> = {}) {
  return {
    id: "t1",
    modelKey: "qwen-image-mock",
    status: overrides.status ?? "pending",
    prompt: overrides.prompt ?? "一只猫",
    params: { size: "1K", ratio: "原始", count: 1 },
    refImages: [],
    outputs: [],
    credit: 1,
    error: null,
    createdAt: 0,
    updatedAt: 0,
  };
}
