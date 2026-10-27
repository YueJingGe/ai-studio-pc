import { TERMINAL_STATUSES, type TaskStatus } from "@ai-studio/contracts";

const ALLOWED: Record<TaskStatus, readonly TaskStatus[]> = {
  pending: ["running", "failed", "canceled"],
  running: ["succeeded", "failed", "canceled"],
  succeeded: [],
  failed: [],
  canceled: [],
};

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  const allowed = ALLOWED[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`illegal task transition: ${from} -> ${to}`);
  }
}

export function isTerminal(status: TaskStatus): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}
