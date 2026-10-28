import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadEnv } from "../src/env.js";
import { CASSETTE_INPUT } from "../src/providers/cassetteInput.js";
import { DashScopeProvider } from "../src/providers/dashscope.js";

async function main() {
  const env = loadEnv();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dashscope-record-"));
  const provider = new DashScopeProvider({
    apiKey: env.DASHSCOPE_API_KEY ?? "",
    storageDir: tmp,
    cassetteDir: env.CASSETTE_DIR,
    cassetteMode: "record",
    model: env.DASHSCOPE_IMAGE_MODEL,
    baseUrl: env.DASHSCOPE_BASE_URL,
  });
  const ref = await provider.submit({ ...CASSETTE_INPUT });
  console.log("[record] submitted:", ref.ref);
  for (;;) {
    const r = await provider.poll(ref);
    console.log("[record] poll:", r.status);
    if (r.status === "succeeded") {
      console.log("[record] outputs:", r.outputs);
      const previewSrc = path.join(tmp, "cassette-fixed-task-0.png");
      if (fs.existsSync(previewSrc)) fs.copyFileSync(previewSrc, path.join(env.CASSETTE_DIR, "preview.png"));
      break;
    }
    if (r.status === "failed") {
      console.error("[record] failed:", r.error);
      process.exit(1);
    }
    await new Promise((res) => setTimeout(res, 2000));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(env.CASSETTE_DIR, { recursive: true });
  fs.writeFileSync(path.join(env.CASSETTE_DIR, "meta.json"), JSON.stringify({ model: env.DASHSCOPE_IMAGE_MODEL }, null, 2));
  console.log("[record] cassette saved:", env.CASSETTE_DIR, "model:", env.DASHSCOPE_IMAGE_MODEL);
}

void main();
