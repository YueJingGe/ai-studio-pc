import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

export function uploadsRoute(app: FastifyInstance, storageDir: string): void {
  app.post("/api/uploads", async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ code: "NO_FILE", message: "未收到上传文件", requestId: request.id });
    }
    const ext = path.extname(file.filename || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return reply.status(400).send({ code: "BAD_FILE_TYPE", message: `不支持的文件类型: ${ext || "(无扩展名)"}`, requestId: request.id });
    }
    const buf = await file.toBuffer();
    const name = `${randomUUID()}${ext}`;
    const dir = path.join(storageDir, "uploads");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buf);
    return { url: `/static/uploads/${name}` };
  });
}
