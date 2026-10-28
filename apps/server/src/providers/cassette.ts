import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type CassetteMode = "off" | "record" | "replay";

export interface CassetteEntry {
  key: string;
  request: { method: string; path: string; body: unknown };
  /** 响应 JSON；图片等二进制以 base64 存 blob。Authorization 等密钥头永不落盘（ADR-004） */
  response: { status: number; json?: unknown; blob?: string };
}

/** 外部 API 记录回放（VCR 模式）：record 录一次、replay 永久确定性回放 */
export class Cassette {
  constructor(
    readonly dir: string,
    readonly mode: CassetteMode,
  ) {}

  keyFor(method: string, p: string, body: unknown): string {
    return crypto.createHash("sha256").update(`${method}\n${p}\n${JSON.stringify(body)}`).digest("hex").slice(0, 16);
  }

  private fileFor(key: string): string {
    return path.join(this.dir, `${key}.json`);
  }

  find(key: string): CassetteEntry | null {
    try {
      return JSON.parse(fs.readFileSync(this.fileFor(key), "utf-8")) as CassetteEntry;
    } catch {
      return null;
    }
  }

  save(entry: CassetteEntry): void {
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(this.fileFor(entry.key), JSON.stringify(entry, null, 2));
  }
}
