import "dotenv/config";
import fs from "node:fs";
import { loadEnv } from "../env.js";

const env = loadEnv();
fs.rmSync(env.DATA_DIR, { recursive: true, force: true });
fs.rmSync(env.STORAGE_DIR, { recursive: true, force: true });
console.log("[reset] removed", env.DATA_DIR, env.STORAGE_DIR);
