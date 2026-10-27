import { RefreshCw } from "lucide-react";
import type { TaskView } from "@ai-studio/contracts";
import clsx from "clsx";

const STATUS_LABEL: Record<TaskView["status"], string> = {
  pending: "排队中",
  running: "生成中",
  succeeded: "已成功",
  failed: "失败",
  canceled: "已取消",
};

const STATUS_STYLE: Record<TaskView["status"], string> = {
  pending: "bg-zinc-500/20 text-zinc-300",
  running: "bg-sky-500/20 text-sky-300",
  succeeded: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-red-500/20 text-red-300",
  canceled: "bg-zinc-500/20 text-zinc-400",
};

export function TaskCard({ task, onRetry }: { task: TaskView; onRetry?: (task: TaskView) => void }) {
  return (
    <article aria-label={`任务 ${task.id.slice(0, 8)}`} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <header className="mb-2 flex items-center gap-2 text-xs">
        <span className={clsx("rounded px-2 py-0.5", STATUS_STYLE[task.status])}>{STATUS_LABEL[task.status]}</span>
        <span className="text-zinc-500">
          {task.params.size} · {task.params.ratio} · ×{task.params.count}
        </span>
        <span className="ml-auto text-zinc-500">积分 {task.credit}</span>
      </header>
      <p className="mb-3 line-clamp-2 text-sm text-zinc-200">{task.prompt}</p>
      {task.status === "succeeded" ? (
        <div className="grid grid-cols-2 gap-2">
          {task.outputs.map((u, i) => (
            <img key={`${u}-${i}`} src={u} alt={`${task.prompt} 结果${i + 1}`} loading="lazy" className="aspect-[3/4] w-full rounded-lg object-cover" />
          ))}
        </div>
      ) : null}
      {task.status === "running" ? <div aria-label="生成中占位" className="h-28 animate-pulse rounded-lg bg-[var(--panel-2)]" /> : null}
      {task.status === "pending" ? <div aria-label="排队中占位" className="h-28 rounded-lg bg-[var(--panel-2)] opacity-60" /> : null}
      {task.status === "failed" ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <span className="line-clamp-1">{task.error ?? "生成失败"}</span>
          {onRetry ? (
            <button onClick={() => onRetry(task)} className="flex shrink-0 items-center gap-1 text-zinc-200 hover:text-white">
              <RefreshCw size={12} /> 重试
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
