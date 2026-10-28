import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { AssetListQuery, type AssetView } from "@ai-studio/contracts";
import { desc, eq } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { assets } from "../db/schema.js";

export function assetsRoute(app: FastifyInstance, db: Db, storageDir: string, persist: () => void): void {
  app.get("/api/assets", async (request, reply) => {
    const parsed = AssetListQuery.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ code: "VALIDATION_ERROR", message: "query 校验失败", requestId: request.id, details: parsed.error.issues });
    }
    const rows = parsed.data.type
      ? db.select().from(assets).where(eq(assets.type, parsed.data.type)).orderBy(desc(assets.createdAt)).all()
      : db.select().from(assets).orderBy(desc(assets.createdAt)).all();
    const list: AssetView[] = rows.map((r) => ({
      id: r.id,
      type: r.type as AssetView["type"],
      url: r.url,
      taskId: r.taskId,
      modelKey: r.modelKey,
      createdAt: r.createdAt,
    }));
    return { assets: list };
  });

  app.delete("/api/assets/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(assets).where(eq(assets.id, id)).all()[0];
    if (!row) {
      return reply.status(404).send({ code: "ASSET_NOT_FOUND", message: `资产不存在: ${id}`, requestId: request.id });
    }
    db.delete(assets).where(eq(assets.id, id)).run();
    const remaining = db.select().from(assets).where(eq(assets.url, row.url)).all().length;
    if (remaining === 0 && row.url.startsWith("/static/")) {
      try {
        fs.unlinkSync(path.join(storageDir, row.url.replace("/static/", "")));
      } catch {
        /* 文件不存在忽略 */
      }
    }
    persist();
    return { ok: true };
  });
}
