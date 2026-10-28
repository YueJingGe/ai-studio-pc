import { Download, ImagePlus, PencilLine, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ModelInfo, TaskView } from "@ai-studio/contracts";
import clsx from "clsx";

const STATUS_LABEL: Record<TaskView["status"], string> = {
  pending: "排队中",
  running: "生成中",
  succeeded: "已成功",
  failed: "失败",
  canceled: "已取消",
};

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 生成中百分比：服务端未给进度时按耗时模拟（15s 到 99%） */
function useSimulatedPercent(active: boolean, createdAt: number): number {
  const [p, setP] = useState(5);
  useEffect(() => {
    if (!active) return;
    const tick = () => setP(Math.min(99, 5 + Math.round((Date.now() - createdAt) / 150)));
    tick();
    const t = setInterval(tick, 400);
    return () => clearInterval(t);
  }, [active, createdAt]);
  return p;
}

export interface TaskCardProps {
  task: TaskView;
  model?: ModelInfo;
  onRegenerate?: (task: TaskView) => void;
  onEdit?: (task: TaskView) => void;
  onDelete?: (task: TaskView) => void;
}

export function TaskCard({ task, model, onRegenerate, onEdit, onDelete }: TaskCardProps) {
  const percent = useSimulatedPercent(task.status === "running", task.createdAt);
  return (
    <article aria-label={`任务 ${task.id.slice(0, 8)}`} className="rounded-2xl bg-[var(--panel)] p-4">
      <header className="mb-3 flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1.5 text-zinc-100">
          <ImagePlus size={16} className="text-zinc-400" />
          <span className="font-medium">AI生图</span>
        </span>
        <span className="truncate text-zinc-200">{task.prompt}</span>
        <span className="shrink-0 text-xs text-zinc-500">{model?.name ?? task.modelKey}</span>
        <span className="shrink-0 text-xs text-zinc-500">{task.params.ratio}</span>
        <span className="shrink-0 text-xs text-zinc-500">{task.params.size}</span>
        <span
          className={clsx(
            "shrink-0 rounded px-2 py-0.5 text-xs",
            task.status === "succeeded"
              ? "bg-emerald-500/20 text-emerald-300"
              : task.status === "failed"
                ? "bg-red-500/20 text-red-300"
                : "bg-zinc-500/20 text-zinc-300",
          )}
        >
          {STATUS_LABEL[task.status]}
        </span>
        <span className="ml-auto shrink-0 text-xs text-zinc-500">{fmtDate(task.createdAt)} | AI生成</span>
      </header>

      {task.status === "pending" ? (
        <div aria-label="排队中" className="grid h-56 place-items-center rounded-xl bg-[var(--panel-2)]">
          <span className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
            排队中…
          </span>
        </div>
      ) : null}

      {task.status === "running" ? (
        <div aria-label="生成中" className="relative grid h-72 w-64 place-items-end overflow-hidden rounded-xl bg-[var(--panel-2)] p-5">
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(60%_60%_at_30%_30%,rgba(99,102,241,.55),transparent),radial-gradient(50%_50%_at_70%_60%,rgba(236,72,153,.45),transparent),radial-gradient(40%_40%_at_50%_80%,rgba(245,158,11,.35),transparent)] blur-2xl" />
          <div className="relative">
            <p className="font-serif text-5xl font-bold italic tracking-tight text-white">{percent}%</p>
            <p className="mt-1 text-sm text-zinc-200">AI加速绘图中...</p>
          </div>
        </div>
      ) : null}

      {task.status === "succeeded" ? (
        <div className="flex flex-wrap gap-3">
          {task.outputs.map((u, i) => (
            <img
              key={`${u}-${i}`}
              src={u}
              alt={`${task.prompt} 结果${i + 1}`}
              loading="lazy"
              className="max-h-[420px] w-auto rounded-xl object-cover"
              style={{ aspectRatio: "3/4" }}
            />
          ))}
        </div>
      ) : null}

      {task.status === "failed" ? (
        <div className="flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span className="line-clamp-1">{task.error ?? "生成失败"}</span>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        {onRegenerate ? (
          <button onClick={() => onRegenerate(task)} className="flex items-center gap-1.5 rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm text-zinc-200 hover:text-white">
            <RefreshCw size={14} /> 再次生成
          </button>
        ) : null}
        {onEdit ? (
          <button onClick={() => onEdit(task)} className="flex items-center gap-1.5 rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm text-zinc-200 hover:text-white">
            <PencilLine size={14} /> 重新编辑
          </button>
        ) : null}
        {task.status === "succeeded" ? (
          <a
            href={task.outputs[0]}
            download
            aria-label="下载"
            className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--panel-2)] text-zinc-200 hover:text-white"
          >
            <Download size={15} />
          </a>
        ) : null}
        {onDelete ? (
          <button onClick={() => onDelete(task)} aria-label="删除" className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--panel-2)] text-zinc-400 hover:text-white">
            <Trash2 size={15} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
