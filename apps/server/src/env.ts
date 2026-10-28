import { z } from "zod";

const EnvSchema = z
  .object({
    PORT: z.coerce.number().int().default(8787),
    HOST: z.string().default("127.0.0.1"),
    PROVIDER: z.enum(["mock", "dashscope", "comfyui"]).default("mock"),
    DATA_DIR: z.string().default("./data"),
    STORAGE_DIR: z.string().default("./storage"),
    DASHSCOPE_API_KEY: z.string().min(1).optional(),
    DASHSCOPE_IMAGE_MODEL: z.string().default("qwen-image"),
    DASHSCOPE_BASE_URL: z.string().default("https://dashscope.aliyuncs.com"),
    CASSETTE_MODE: z.enum(["off", "record", "replay"]).default("off"),
    CASSETTE_DIR: z.string().default("./cassettes"),
    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_SECRET_KEY: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.PROVIDER === "dashscope" && !v.DASHSCOPE_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["DASHSCOPE_API_KEY"],
        message: "PROVIDER=dashscope 需要 DASHSCOPE_API_KEY（见 .env.example；key 仅服务端持有）",
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    console.error("[env] 配置校验失败:", JSON.stringify(parsed.error.issues, null, 2));
    process.exit(1);
  }
  return parsed.data;
}
