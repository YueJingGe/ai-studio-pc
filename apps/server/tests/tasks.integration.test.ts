import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createDb } from "../src/db/client.js";
import { models } from "../src/db/schema.js";
import { InProcessQueue } from "../src/engine/queue.js";
import { MockProvider } from "../src/providers/mock.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("tasks integration (mock provider)", () => {
  it("full lifecycle: create → poll → succeeded → assets", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aistudio-it-"));
    const dbFile = path.join(dir, "studio.db");
    const studio = await createDb(dbFile);
    const { db, persist } = studio;

    db.insert(models)
      .values({
        modelKey: "qwen-image-mock",
        name: "Qwen-Image 3.0（Mock）",
        type: "image",
        desc: "test",
        tag: "New",
        price: 1,
        capabilitiesJson: JSON.stringify({ supportsPrompt: true, requiresInputs: [] }),
        paramsJson: JSON.stringify({ sizes: ["1K"], ratios: ["1:1"], maxCount: 4 }),
      })
      .run();

    const env = {
      PORT: 0,
      HOST: "127.0.0.1",
      PROVIDER: "mock",
      DATA_DIR: dir,
      STORAGE_DIR: path.join(dir, "storage"),
    } as const;
    const app = await buildApp({
      env: { ...env } as never,
      db,
      provider: new MockProvider(),
      queue: new InProcessQueue(2),
      persist,
    });

    const created = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { modelKey: "qwen-image-mock", prompt: "一只猫", params: { size: "1K", ratio: "1:1", count: 2 } },
    });
    expect(created.statusCode).toBe(202);
    const task = (created.json() as { task: { id: string; status: string; credit: number } }).task;
    expect(task.status).toBe("pending");
    expect(task.credit).toBe(0); // 积分逻辑已移除

    // 轮询至终态
    let status = task.status;
    for (let i = 0; i < 40 && status !== "succeeded" && status !== "failed"; i += 1) {
      await sleep(250);
      const res = await app.inject({ method: "GET", url: `/api/tasks/${task.id}` });
      status = (res.json() as { task: { status: string } }).task.status;
    }
    expect(status).toBe("succeeded");

    const detail = await app.inject({ method: "GET", url: `/api/tasks/${task.id}` });
    const view = (detail.json() as { task: { outputs: string[] } }).task;
    expect(view.outputs).toHaveLength(2);

    const assetsRes = await app.inject({ method: "GET", url: "/api/assets?type=image" });
    const assets = (assetsRes.json() as { assets: unknown[] }).assets;
    expect(assets).toHaveLength(2);

    // 删除任务 → 任务与资产同时消失
    const del = await app.inject({ method: "DELETE", url: `/api/tasks/${task.id}` });
    expect(del.statusCode).toBe(200);
    const afterDel = await app.inject({ method: "GET", url: "/api/tasks" });
    expect((afterDel.json() as { tasks: unknown[] }).tasks).toHaveLength(0);
    const assetsAfterDel = await app.inject({ method: "GET", url: "/api/assets?type=image" });
    expect((assetsAfterDel.json() as { assets: unknown[] }).assets).toHaveLength(0);
    const del404 = await app.inject({ method: "DELETE", url: `/api/tasks/${task.id}` });
    expect(del404.statusCode).toBe(404);

    // 仅图输入（无 prompt）也应成功
    const imgOnly = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { modelKey: "qwen-image-mock", params: { size: "1K", ratio: "1:1", count: 1 }, refImages: ["/static/mock/mock-1.svg"] },
    });
    expect(imgOnly.statusCode).toBe(202);
    // 空输入（无 prompt 无图）应 400
    const empty = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { modelKey: "qwen-image-mock", params: { size: "1K", ratio: "1:1", count: 1 } },
    });
    expect(empty.statusCode).toBe(400);


    // 校验失败信封
    const bad = await app.inject({ method: "POST", url: "/api/tasks", payload: { modelKey: "", prompt: "" } });
    expect(bad.statusCode).toBe(400);
    expect((bad.json() as { code: string }).code).toBe("VALIDATION_ERROR");

    // 模型不存在
    const nf = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { modelKey: "nope", prompt: "x", params: { size: "1K", ratio: "1:1", count: 1 } },
    });
    expect(nf.statusCode).toBe(404);

    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("runner 异常兜底", () => {
  it("provider submit 抛异常时任务落 failed，不滞留 pending", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aistudio-fail-"));
    const dbFile = path.join(dir, "studio.db");
    const { db, persist } = await createDb(dbFile);
    db.insert(models)
      .values({
        modelKey: "m-fail",
        name: "fail model",
        type: "image",
        desc: "t",
        tag: null,
        price: 1,
        capabilitiesJson: JSON.stringify({ supportsPrompt: true, requiresInputs: [] }),
        paramsJson: JSON.stringify({ sizes: ["1K"], ratios: ["1:1"], maxCount: 1 }),
      })
      .run();

    const env = { PORT: 0, HOST: "127.0.0.1", PROVIDER: "mock", DATA_DIR: dir, STORAGE_DIR: path.join(dir, "storage") } as const;
    const throwing = {
      name: "throwing",
      submit: async () => {
        throw new Error("Model not exist");
      },
      poll: async () => ({ status: "pending" as const }),
    };
    const app = await buildApp({
      env: { ...env } as never,
      db,
      provider: throwing,
      queue: new InProcessQueue(2),
      persist,
    });
    const created = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { modelKey: "m-fail", prompt: "x", params: { size: "1K", ratio: "1:1", count: 1 } },
    });
    const id = (created.json() as { task: { id: string } }).task.id;
    let status = "pending";
    for (let i = 0; i < 20 && status === "pending"; i += 1) {
      await sleep(100);
      const res = await app.inject({ method: "GET", url: `/api/tasks/${id}` });
      const t = (res.json() as { task: { status: string; error: string | null } }).task;
      status = t.status;
      if (status === "failed") expect(t.error).toContain("Model not exist");
    }
    expect(status).toBe("failed");
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
