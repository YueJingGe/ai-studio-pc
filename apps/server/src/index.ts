import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { buildApp } from "./app.js";
import { createDb } from "./db/client.js";
import { loadEnv } from "./env.js";
import { InProcessQueue } from "./engine/queue.js";
import { getProvider } from "./providers/registry.js";

async function main() {
  const env = loadEnv();
  fs.mkdirSync(env.DATA_DIR, { recursive: true });
  const { db, persist } = await createDb(path.join(env.DATA_DIR, "studio.db"));
  const app = await buildApp({
    env,
    db,
    provider: getProvider(env),
    queue: new InProcessQueue(2),
    persist,
  });
  await app.listen({ port: env.PORT, host: env.HOST });
}

void main();
