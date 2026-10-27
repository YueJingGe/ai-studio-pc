import type { CreateTaskInput } from "@ai-studio/contracts";
import type { ProviderAdapter, ProviderPollResult, ProviderRef } from "./base.js";

const MOCK_POOL = ["/static/mock/mock-1.svg", "/static/mock/mock-2.svg", "/static/mock/mock-3.svg"];

interface MockState {
  startedAt: number;
  count: number;
}

/** demo/E2E 底座：人工延迟模拟 排队→生成中→成功；taskId 以 fail 结尾时模拟失败 */
export class MockProvider implements ProviderAdapter {
  readonly name = "mock";
  private readonly state = new Map<string, MockState>();

  async submit(input: CreateTaskInput & { taskId: string }): Promise<ProviderRef> {
    this.state.set(input.taskId, { startedAt: Date.now(), count: input.params.count });
    return { provider: this.name, ref: input.taskId };
  }

  async poll(ref: ProviderRef): Promise<ProviderPollResult> {
    const s = this.state.get(ref.ref) ?? { startedAt: Date.now(), count: 1 };
    const elapsed = Date.now() - s.startedAt;
    if (elapsed < 600) return { status: "pending" };
    if (elapsed < 1800) return { status: "running", progress: Math.min(99, Math.round((elapsed - 600) / 12)) };
    if (ref.ref.endsWith("-fail")) return { status: "failed", error: "mock induced failure" };
    const outputs: string[] = [];
    for (let i = 0; i < s.count; i += 1) outputs.push(MOCK_POOL[i % MOCK_POOL.length] as string);
    return { status: "succeeded", outputs };
  }
}
