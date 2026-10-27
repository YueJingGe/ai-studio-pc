import type { FastifyInstance } from "fastify";
import { ModelInfo } from "@ai-studio/contracts";
import type { Db } from "../db/client.js";
import { models } from "../db/schema.js";

export function modelsRoute(app: FastifyInstance, db: Db): void {
  app.get("/api/models", async () => {
    const rows = db.select().from(models).all();
    const list = rows.map((r) =>
      ModelInfo.parse({
        modelKey: r.modelKey,
        name: r.name,
        type: r.type,
        desc: r.desc,
        tag: r.tag ?? undefined,
        price: r.price,
        capabilities: JSON.parse(r.capabilitiesJson),
        params: JSON.parse(r.paramsJson),
      }),
    );
    return { models: list };
  });
}
