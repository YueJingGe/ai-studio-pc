import type { CreateTaskInput } from "@ai-studio/contracts";

export interface ProviderRef {
  provider: string;
  ref: string;
}

export type ProviderPollResult =
  | { status: "pending" }
  | { status: "running"; progress?: number }
  | { status: "succeeded"; outputs: string[] }
  | { status: "failed"; error: string };

export interface ProviderAdapter {
  readonly name: string;
  submit(input: CreateTaskInput & { taskId: string }): Promise<ProviderRef>;
  poll(ref: ProviderRef): Promise<ProviderPollResult>;
  cancel?(ref: ProviderRef): Promise<void>;
}
