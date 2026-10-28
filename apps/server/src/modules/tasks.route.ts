import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { CreateTaskInput } from "@ai-studio/contracts";
import { desc, eq } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { models, tasks } from "../db/schema.js";
import type { InProcessQueue } from "../engine/queue.js";
import { getTaskView, runTask } from "../engine/runner.js";
import type { ProviderAdapter } from "../providers/base.js";

export interface TasksDeps {
  db: Db;
  queue: InProcessQueue;
  provider: ProviderAdapter;
  persist: () => void;
}

export function tasksRoute(app: FastifyInstance, deps: TasksDeps): void {
  app.post("/api/tasks", async (request, reply) => {
    const parsed = CreateTaskInput.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "请求体校验失败",
        requestId: request.id,
        details: parsed.error.issues,
      });
    }
    const input = parsed.data;
    const model = deps.db.select().from(models).where(eq(models.modelKey, input.modelKey)).all()[0];
    if (!model) {
      return reply.status(404).send({
        code: "MODEL_NOT_FOUND",
        message: `模型不存在: ${input.modelKey}`,
        requestId: request.id,
      });
    }
    const now = Date.now();
    const id = randomUUID();
    const credit = 0; // 积分逻辑已按需求移除（P2 再议）
    deps.db
      .insert(tasks)
      .values({
        id,
        modelKey: input.modelKey,
        status: "pending",
        prompt: input.prompt,
        paramsJson: JSON.stringify(input.params),
        refImagesJson: JSON.stringify(input.refImages ?? []),
        outputsJson: "[]",
        credit,
        error: null,
        providerRefJson: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    deps.persist();
    deps.queue.push(() => runTask({ db: deps.db, provider: deps.provider, persist: deps.persist }, id));
    const view = getTaskView(deps.db, id);
    return reply.status(202).send({ task: view });
  });

  app.get("/api/tasks", async () => {
    const rows = deps.db.select().from(tasks).orderBy(desc(tasks.createdAt)).all();
    return { tasks: rows.map((r) => getTaskView(deps.db, r.id)).filter((v): v is NonNullable<typeof v> => v !== null) };
  });

  app.get("/api/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const view = getTaskView(deps.db, id);
    if (!view) {
      return reply.status(404).send({ code: "TASK_NOT_FOUND", message: `任务不存在: ${id}`, requestId: request.id });
    }
    return { task: view };
  });
}
