import { useQuery } from "@tanstack/react-query";
import { TERMINAL_STATUSES, type TaskStatus } from "@ai-studio/contracts";
import { api } from "../services/api";

/** 轮询退避纯函数：终态自停；1s→2s→4s→8s 封顶（ADR-002） */
export function backoffInterval(status: TaskStatus, attempts: number): number | false {
  if ((TERMINAL_STATUSES as readonly string[]).includes(status)) return false;
  return Math.min(8000, 1000 * 2 ** Math.min(Math.max(attempts, 0), 3));
}

export function useTaskQuery(taskId: string | null) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => api.task(taskId ?? ""),
    enabled: taskId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.task.status ?? "pending";
      return backoffInterval(status, query.state.dataUpdateCount);
    },
  });
}
