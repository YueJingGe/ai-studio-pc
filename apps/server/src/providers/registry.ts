import type { Env } from "../env.js";
import type { ProviderAdapter } from "./base.js";
import { DashScopeProvider } from "./dashscope.js";
import { MockProvider } from "./mock.js";

export function getProvider(env: Env): ProviderAdapter {
  switch (env.PROVIDER) {
    case "mock":
      return new MockProvider();
    case "dashscope":
      return new DashScopeProvider({
        apiKey: env.DASHSCOPE_API_KEY ?? "",
        storageDir: env.STORAGE_DIR,
        cassetteDir: env.CASSETTE_DIR,
        cassetteMode: env.CASSETTE_MODE,
        model: env.DASHSCOPE_IMAGE_MODEL,
        baseUrl: env.DASHSCOPE_BASE_URL,
      });
    case "comfyui":
      throw new Error("ComfyUIProvider 预留（P3 接本机 ComfyUI /prompt）");
  }
}
