import fs from "node:fs";
import path from "node:path";
import type { CreateTaskInput } from "@ai-studio/contracts";
import type { ProviderAdapter, ProviderPollResult, ProviderRef } from "./base.js";
import { Cassette, type CassetteMode } from "./cassette.js";

const BASE = "https://dashscope.aliyuncs.com";

export interface DashScopeOptions {
  apiKey: string;
  storageDir: string;
  cassetteDir: string;
  cassetteMode: CassetteMode;
  /** 模型 ID，百炼控制台模型广场可查（默认 qwen-image） */
  model?: string;
}

interface RefPayload {
  taskId: string;
  remoteTaskId: string;
}

/** size(1K/2K) × ratio → qwen-image 像素（16 的倍数，边长 ≤2048） */
const SIZE_MAP: Record<string, Record<string, string>> = {
  "1K": { "1:1": "1024*1024", "3:4": "960*1280", "4:3": "1280*960", "9:16": "720*1280", "16:9": "1280*720", 原始: "1024*1024" },
  "2K": { "1:1": "2048*2048", "3:4": "1536*2048", "4:3": "2048*1536", "9:16": "1152*2048", "16:9": "2048*1152", 原始: "2048*2048" },
};

export function pixelsFor(size: string, ratio: string): string {
  return SIZE_MAP[size]?.[ratio] ?? "1024*1024";
}

interface SubmitResponse {
  output?: { task_id?: string };
  code?: string;
  message?: string;
}
interface PollResponse {
  output?: {
    task_status?: string;
    choices?: { message?: { content?: { image?: string }[] } }[];
    message?: string;
    code?: string;
  };
  code?: string;
}

/**
 * 百炼 qwen-image 异步任务适配器：submit(X-DashScope-Async) → poll(/tasks/{id}) → 下载落盘。
 * 密钥仅存于内存；cassette 录放保证 CI 确定性（ADR-003/004）。
 */
export class DashScopeProvider implements ProviderAdapter {
  readonly name = "dashscope";
  private readonly cassette: Cassette;

  constructor(private readonly opts: DashScopeOptions) {
    if (!opts.apiKey) throw new Error("DashScopeProvider 需要 DASHSCOPE_API_KEY");
    this.cassette = new Cassette(opts.cassetteDir, opts.cassetteMode);
  }

  private async apiJson<T>(method: "GET" | "POST", apiPath: string, body?: unknown): Promise<{ status: number; json: T }> {
    const key = this.cassette.keyFor(method, apiPath, body ?? null);
    if (this.cassette.mode === "replay") {
      const entry = this.cassette.find(key);
      if (!entry || entry.response.json === undefined) throw new Error(`cassette miss: ${method} ${apiPath} (${key})`);
      return { status: entry.response.status, json: entry.response.json as T };
    }
    const res = await fetch(BASE + apiPath, {
      method,
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "Content-Type": "application/json",
        ...(method === "POST" ? { "X-DashScope-Async": "enable" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await res.json()) as T;
    if (this.cassette.mode === "record") {
      this.cassette.save({ key, request: { method, path: apiPath, body: body ?? null }, response: { status: res.status, json } });
    }
    return { status: res.status, json };
  }

  private async download(url: string, destName: string): Promise<string> {
    const key = this.cassette.keyFor("GET", url, null);
    let buf: Buffer;
    if (this.cassette.mode === "replay") {
      const entry = this.cassette.find(key);
      if (!entry?.response.blob) throw new Error(`cassette blob miss: ${key}`);
      buf = Buffer.from(entry.response.blob, "base64");
    } else {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`下载生成图失败: ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
      if (this.cassette.mode === "record") {
        this.cassette.save({ key, request: { method: "GET", path: url, body: null }, response: { status: res.status, blob: buf.toString("base64") } });
      }
    }
    const dir = path.join(this.opts.storageDir, "generated");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, destName), buf);
    return `/static/generated/${destName}`;
  }

  async submit(input: CreateTaskInput & { taskId: string }): Promise<ProviderRef> {
    const body = {
      model: this.opts.model ?? "qwen-image",
      input: { messages: [{ role: "user", content: [{ text: input.prompt }] }] },
      parameters: {
        size: pixelsFor(input.params.size, input.params.ratio),
        n: input.params.count,
        prompt_extend: false,
        seed: 42,
      },
    };
    const { status, json } = await this.apiJson<SubmitResponse>(
      "POST",
      "/api/v1/services/aigc/multimodal-generation/generation",
      body,
    );
    const remoteTaskId = json.output?.task_id;
    if (status !== 200 || !remoteTaskId) {
      throw new Error(`dashscope submit 失败: ${json.code ?? status} ${json.message ?? ""}`.trim());
    }
    const ref: RefPayload = { taskId: input.taskId, remoteTaskId };
    return { provider: this.name, ref: JSON.stringify(ref) };
  }

  async poll(ref: ProviderRef): Promise<ProviderPollResult> {
    const { taskId, remoteTaskId } = JSON.parse(ref.ref) as RefPayload;
    const { json } = await this.apiJson<PollResponse>("GET", `/api/v1/tasks/${remoteTaskId}`);
    const out = json.output;
    const st = out?.task_status;
    if (st === "PENDING") return { status: "pending" };
    if (st === "RUNNING") return { status: "running" };
    if (st === "SUCCEEDED") {
      const images = (out?.choices ?? [])
        .map((c) => c.message?.content?.[0]?.image)
        .filter((x): x is string => Boolean(x));
      const outputs: string[] = [];
      for (let i = 0; i < images.length; i += 1) {
        outputs.push(await this.download(images[i] as string, `${taskId}-${i}.png`));
      }
      return { status: "succeeded", outputs };
    }
    if (st === "FAILED" || st === "CANCELED" || st === "UNKNOWN") {
      return { status: "failed", error: out?.message ?? json.code ?? String(st) };
    }
    return { status: "running" };
  }
}
