import type { CreateTaskInput } from "@ai-studio/contracts";
import type { ProviderAdapter, ProviderPollResult, ProviderRef } from "./base.js";

/** M4 实现：qwen-image 异步任务（submit → poll → 下载落盘）+ cassette 录放 wrapper。
 *  密钥仅在本类内部使用；日志与 cassette 录制必须 mask authorization 头。 */
export class DashScopeProvider implements ProviderAdapter {
  readonly name = "dashscope";

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("DashScopeProvider 需要 DASHSCOPE_API_KEY");
  }

  async submit(_input: CreateTaskInput & { taskId: string }): Promise<ProviderRef> {
    throw new Error("DashScopeProvider 将于 M4 里程碑实现（当前 PROVIDER=mock 可全链路演示）");
  }

  async poll(_ref: ProviderRef): Promise<ProviderPollResult> {
    throw new Error("DashScopeProvider 将于 M4 里程碑实现");
  }
}
