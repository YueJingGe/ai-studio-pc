import fs from "node:fs";
import path from "node:path";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticPlugin from "@fastify/static";
import Fastify, { type FastifyError } from "fastify";
import type { Db } from "./db/client.js";
import type { Env } from "./env.js";
import type { InProcessQueue } from "./engine/queue.js";
import { assetsRoute } from "./modules/assets.route.js";
import { modelsRoute } from "./modules/models.route.js";
import { tasksRoute } from "./modules/tasks.route.js";
import { uploadsRoute } from "./modules/uploads.route.js";
import type { ProviderAdapter } from "./providers/base.js";

export interface AppDeps {
  env: Env;
  db: Db;
  provider: ProviderAdapter;
  queue: InProcessQueue;
  persist: () => void;
}

export async function buildApp(deps: AppDeps) {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === "test"
        ? false
        : {
            level: "info",
            transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } },
            // 日志脱敏：任何授权头不落日志
            redact: { paths: ["req.headers.authorization", "headers.authorization"], remove: true },
          },
  });

  app.setErrorHandler((err: FastifyError, request, reply) => {
    request.log.error(err);
    const statusCode = err.statusCode ?? 500;
    void reply.status(statusCode).send({
      code: (err.code as string) ?? "INTERNAL_ERROR",
      message: err.message,
      requestId: request.id,
      details: err.validation ? err.validation : undefined,
    });
  });
  app.setNotFoundHandler((request, reply) => {
    void reply.status(404).send({
      code: "NOT_FOUND",
      message: `路由不存在: ${request.method} ${request.url}`,
      requestId: request.id,
    });
  });

  await app.register(cors, { origin: true });
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  fs.mkdirSync(path.join(deps.env.STORAGE_DIR, "uploads"), { recursive: true });
  await app.register(staticPlugin, { prefix: "/static/", root: path.resolve(deps.env.STORAGE_DIR) });
  await app.register(staticPlugin, {
    prefix: "/static/mock/",
    root: path.resolve("./assets/mock"),
    decorateReply: false,
  });

  app.get("/api/health", async () => ({ ok: true, provider: deps.provider.name }));
  modelsRoute(app, deps.db);
  tasksRoute(app, { ...deps, storageDir: deps.env.STORAGE_DIR });
  assetsRoute(app, deps.db, deps.env.STORAGE_DIR, deps.persist);
  uploadsRoute(app, deps.env.STORAGE_DIR);

  return app;
}
