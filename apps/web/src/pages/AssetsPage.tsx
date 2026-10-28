import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AssetView } from "@ai-studio/contracts";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { api } from "../services/api";

type Filter = "image" | "video" | "audio";

const FILTERS: [Filter, string][] = [
  ["image", "图片"],
  ["video", "视频"],
  ["audio", "音乐"],
];

function dayLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, now)) return "今天";
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (same(d, yest)) return "昨天";
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function AssetsPage() {
  const [filter, setFilter] = useState<Filter>("image");
  const [pendingDelete, setPendingDelete] = useState<AssetView | null>(null);
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["assets"], queryFn: () => api.assets() });

  const assets = (data?.assets ?? []).filter((a) => a.type === filter);
  const groups: [string, AssetView[]][] = [];
  for (const a of assets) {
    const key = dayLabel(a.createdAt);
    const g = groups.find(([k]) => k === key);
    if (g) g[1].push(a);
    else groups.push([key, [a]]);
  }

  async function remove(a: AssetView) {
    await api.deleteAsset(a.id);
    await queryClient.invalidateQueries({ queryKey: ["assets"] });
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  return (
    <div className="h-full overflow-auto">
      <div className="flex gap-2 px-6 py-4 text-sm">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx("rounded-lg px-3 py-1.5", filter === key ? "bg-[var(--panel-2)] text-white" : "text-zinc-400 hover:text-zinc-100")}
          >
            {label}
          </button>
        ))}
      </div>
      {assets.length === 0 ? (
        <EmptyState text="暂无相关资产" />
      ) : (
        <div className="px-6 pb-8">
          {groups.map(([day, list]) => (
            <section key={day} className="mb-8">
              <h2 className="mb-3 text-base font-semibold text-zinc-100">{day}</h2>
              <div className="grid grid-cols-4 gap-4 xl:grid-cols-6">
                {list.map((a) => (
                  <div key={a.id} className="group relative overflow-hidden rounded-xl bg-[var(--panel)]">
                    <img src={a.url} alt={`资产 ${a.id.slice(0, 8)}`} loading="lazy" className="aspect-square w-full object-cover" />
                    <div className="absolute inset-x-2 bottom-2 translate-y-2 rounded-xl border border-[var(--line)] bg-[#1b1c1e]/95 p-1.5 opacity-0 shadow-2xl backdrop-blur transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                      <a href={a.url} download className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-200 hover:bg-[var(--panel-2)]">
                        <Download size={15} /> 下载
                      </a>
                      <button onClick={() => setPendingDelete(a)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-400 hover:bg-red-500/10">
                        <Trash2 size={15} /> 删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <p className="py-4 text-center text-xs text-zinc-600">—— 没有更多数据了 ——</p>
        </div>
      )}
      {pendingDelete ? (
        <ConfirmDialog
          title="删除该资产？"
          description="删除后不可恢复；若该文件无其他引用将一并清理。"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            const a = pendingDelete;
            setPendingDelete(null);
            void remove(a);
          }}
        />
      ) : null}
    </div>
  );
}
