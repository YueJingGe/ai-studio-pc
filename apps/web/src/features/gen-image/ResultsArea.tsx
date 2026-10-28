import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TERMINAL_STATUSES, type TaskView } from "@ai-studio/contracts";
import { useState } from "react";
import clsx from "clsx";
import { EmptyState } from "../../components/EmptyState";
import { backoffInterval } from "../../hooks/useTaskQuery";
import { api } from "../../services/api";
import { TaskCard } from "./TaskCard";

type Filter = "all" | "video" | "image";

export function ResultsArea({ onEdit }: { onEdit: (task: TaskView) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const queryClient = useQueryClient();

  const { data: modelsData } = useQuery({ queryKey: ["models"], queryFn: () => api.models() });
  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.tasks(),
    refetchInterval: (q) => {
      const tasks = q.state.data?.tasks ?? [];
      const active = tasks.some((t) => !(TERMINAL_STATUSES as readonly string[]).includes(t.status));
      if (!active) return false;
      return backoffInterval("running", q.state.dataUpdateCount);
    },
  });

  const modelOf = (t: TaskView) => modelsData?.models.find((m) => m.modelKey === t.modelKey);
  const typeOf = (t: TaskView) => modelOf(t)?.type ?? "image";
  const tasks = (data?.tasks ?? []).filter((t) => (filter === "all" ? true : typeOf(t) === filter));

  async function resubmit(task: TaskView) {
    await api.createTask({
      modelKey: task.modelKey,
      prompt: task.prompt,
      params: task.params,
      refImages: task.refImages.length > 0 ? task.refImages : undefined,
    });
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  return (
    <section aria-label="生成结果" className="flex-1 overflow-auto">
      <div className="flex gap-2 px-6 py-4 text-sm">
        {(
          [
            ["all", "全部"],
            ["video", "视频"],
            ["image", "图片"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx("rounded-lg px-3 py-1.5", filter === key ? "bg-[var(--panel-2)] text-white" : "text-zinc-400 hover:text-zinc-100")}
          >
            {label}
          </button>
        ))}
      </div>
      {tasks.length === 0 ? (
        <EmptyState text="暂无生成结果" />
      ) : (
        <div className="space-y-4 px-6 pb-8">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} model={modelOf(t)} onRegenerate={(x) => void resubmit(x)} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}
