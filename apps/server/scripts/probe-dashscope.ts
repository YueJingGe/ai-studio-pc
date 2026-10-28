import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "../src/env.js";
import { DashScopeProvider } from "../src/providers/dashscope.js";

/** 用法: tsx scripts/probe-dashscope.ts <modelId> <refImageUrl> [prompt] */
async function main() {
  const [model, refUrl, prompt] = process.argv.slice(2);
  if (!model || !refUrl) throw new Error("usage: probe <modelId> <refUrl> [prompt]");
  const env = loadEnv();
  const provider = new DashScopeProvider({
    apiKey: env.DASHSCOPE_API_KEY ?? "",
    storageDir: env.STORAGE_DIR,
    cassetteDir: env.CASSETTE_DIR,
    cassetteMode: "off",
    model,
  });
  const ref = await provider.submit({
    taskId: "probe-task",
    modelKey: model,
    prompt: prompt ?? "",
    params: { size: "1K", ratio: "1:1", count: 1 },
    refImages: [refUrl],
  });
  console.log("[probe] submitted", ref.ref.slice(0, 80));
  for (let i = 0; i < 40; i += 1) {
    const r = await provider.poll(ref);
    console.log("[probe] poll:", r.status);
    if (r.status === "succeeded") {
      console.log("[probe] outputs:", r.outputs);
      for (const u of r.outputs) {
        const src = path.join(env.STORAGE_DIR, "generated", path.basename(u));
        fs.copyFileSync(src, path.join("/tmp", `probe-${model}-${path.basename(src)}`));
        console.log("[probe] copied to /tmp/probe-" + model + "-" + path.basename(src));
      }
      break;
    }
    if (r.status === "failed") {
      console.error("[probe] failed:", r.error);
      process.exit(1);
    }
    await new Promise((res) => setTimeout(res, 3000));
  }
}
void main();
