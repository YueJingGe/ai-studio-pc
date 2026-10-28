import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DashScopeProvider } from "../src/providers/dashscope.js";
import { CASSETTE_INPUT } from "../src/providers/cassetteInput.js";

const cassetteDir = path.resolve("./cassettes");
const hasCassette = fs.existsSync(cassetteDir) && fs.readdirSync(cassetteDir).some((f) => f.endsWith(".json") && f !== "meta.json");
function recordedModel(): string | undefined {
  try {
    return (JSON.parse(fs.readFileSync(path.join(cassetteDir, "meta.json"), "utf-8")) as { model?: string }).model;
  } catch {
    return undefined;
  }
}

describe.skipIf(!hasCassette)("DashScopeProvider cassette 回放（确定性、无需 key）", () => {
  it("submit→poll→succeeded 且输出落盘", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dashscope-replay-"));
    const provider = new DashScopeProvider({
      apiKey: "sk-cassette-test",
      storageDir: tmp,
      cassetteDir,
      cassetteMode: "replay",
      model: recordedModel(),
    });
    const ref = await provider.submit({ ...CASSETTE_INPUT });
    const result = await provider.poll(ref);
    expect(result.status).toBe("succeeded");
    if (result.status === "succeeded") {
      expect(result.outputs.length).toBeGreaterThan(0);
      for (const u of result.outputs) {
        const file = path.join(tmp, u.replace("/static/generated/", ""));
        expect(fs.existsSync(file)).toBe(true);
        expect(fs.statSync(file).size).toBeGreaterThan(1000);
      }
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
