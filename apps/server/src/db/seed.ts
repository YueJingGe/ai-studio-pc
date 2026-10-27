import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { loadEnv } from "../env.js";
import { createDb } from "./client.js";
import { models } from "./schema.js";

const REGISTRY = [
  {
    modelKey: "qwen-image-mock",
    name: "Qwen-Image 3.0（Mock）",
    type: "image",
    desc: "真实细节，画面更自然（mock provider 演示）",
    tag: "New",
    price: 1,
    capabilities: { supportsPrompt: true, requiresInputs: [] },
    params: { sizes: ["1K", "2K"], ratios: ["原始", "1:1", "3:4", "4:3", "9:16", "16:9"], maxCount: 4 },
  },
  {
    modelKey: "wan30-mock",
    name: "Wan 3.0（Mock·预留）",
    type: "video",
    desc: "30秒一镜到底（P3 视频链路预留）",
    price: 15,
    capabilities: { supportsPrompt: true, requiresInputs: [] },
    params: { sizes: ["720p", "1080p"], ratios: ["16:9", "9:16"], maxCount: 1 },
  },
] as const;

async function main() {
  const env = loadEnv();
  fs.mkdirSync(env.DATA_DIR, { recursive: true });
  const { db, persist } = await createDb(path.join(env.DATA_DIR, "studio.db"));
  for (const m of REGISTRY) {
    const existing = db.select().from(models).where(eq(models.modelKey, m.modelKey)).all();
    if (existing.length > 0) continue;
    db.insert(models)
      .values({
        modelKey: m.modelKey,
        name: m.name,
        type: m.type,
        desc: m.desc,
        tag: "tag" in m ? m.tag : null,
        price: m.price,
        capabilitiesJson: JSON.stringify(m.capabilities),
        paramsJson: JSON.stringify(m.params),
      })
      .run();
    console.log("[seed] model:", m.modelKey);
  }
  persist();
  console.log("[seed] done");
}

void main();
