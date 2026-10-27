import { eq } from "drizzle-orm";
import type { TaskView } from "@ai-studio/contracts";
import type { Db } from "../db/client.js";
import { assets, tasks } from "../db/schema.js";
import type { ProviderAdapter, ProviderRef } from "../providers/base.js";
import { assertTransition, isTerminal } from "./stateMachine.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RunnerDeps {
  db: Db;
  provider: ProviderAdapter;
  persist: () => void;
}

function rowToView(row: typeof tasks.$inferSelect): TaskView {
  return {
    id: row.id,
    modelKey: row.modelKey,
    status: row.status as TaskView["status"],
    prompt: row.prompt,
    params: JSON.parse(row.paramsJson) as TaskView["params"],
    refImages: JSON.parse(row.refImagesJson) as string[],
    outputs: JSON.parse(row.outputsJson) as string[],
    credit: row.credit,
    error: row.error,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function getTaskView(db: Db, id: string): TaskView | null {
  const row = db.select().from(tasks).where(eq(tasks.id, id)).all()[0];
  return row ? rowToView(row) : null;
}

/** 任务执行：pending→running→(succeeded|failed)，成功时产出资产 */
export async function runTask(deps: RunnerDeps, taskId: string): Promise<void> {
  const { db, provider } = deps;
  const row = db.select().from(tasks).where(eq(tasks.id, taskId)).all()[0];
  if (!row) throw new Error(`task not found: ${taskId}`);

  let ref: ProviderRef | null = row.providerRefJson
    ? (JSON.parse(row.providerRefJson) as ProviderRef)
    : null;

  if (!ref) {
    assertTransition(row.status as TaskView["status"], "running");
    ref = await provider.submit({
      taskId,
      modelKey: row.modelKey,
      prompt: row.prompt,
      params: JSON.parse(row.paramsJson) as TaskView["params"],
      refImages: JSON.parse(row.refImagesJson) as string[],
    });
    db.update(tasks)
      .set({ status: "running", providerRefJson: JSON.stringify(ref), updatedAt: Date.now() })
      .where(eq(tasks.id, taskId))
      .run();
  } else if (row.status === "pending") {
    db.update(tasks).set({ status: "running", updatedAt: Date.now() }).where(eq(tasks.id, taskId)).run();
  }

  for (;;) {
    const result = await provider.poll(ref);
    if (result.status === "pending" || result.status === "running") {
      await sleep(250);
      continue;
    }
    const now = Date.now();
    if (result.status === "succeeded") {
      assertTransition("running", "succeeded");
      db.update(tasks)
        .set({ status: "succeeded", outputsJson: JSON.stringify(result.outputs), error: null, updatedAt: now })
        .where(eq(tasks.id, taskId))
        .run();
      const modelRow = db.select().from(tasks).where(eq(tasks.id, taskId)).all()[0];
      const modelType = modelRow?.modelKey.startsWith("wan") ? "video" : "image";
      result.outputs.forEach((url, i) => {
        db.insert(assets)
          .values({
            id: `${taskId}-out-${i}`,
            type: modelType,
            url,
            taskId,
            modelKey: row.modelKey,
            createdAt: now,
          })
          .run();
      });
      deps.persist();
      return;
    }
    assertTransition("running", "failed");
    db.update(tasks)
      .set({ status: "failed", error: result.error, updatedAt: now })
      .where(eq(tasks.id, taskId))
      .run();
    deps.persist();
    return;
  }
}

export { isTerminal };
