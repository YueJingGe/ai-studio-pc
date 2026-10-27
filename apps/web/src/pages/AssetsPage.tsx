import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "../components/EmptyState";
import { api } from "../services/api";

export default function AssetsPage() {
  const { data } = useQuery({ queryKey: ["assets"], queryFn: () => api.assets() });
  const assets = data?.assets ?? [];
  return (
    <div>
      <h1 className="px-6 py-4 text-lg font-semibold">资产</h1>
      <div className="flex gap-2 px-6 pb-4 text-sm">
        {["图片", "视频", "音乐"].map((f, i) => (
          <button
            key={f}
            className={
              i === 0
                ? "rounded-lg bg-[var(--panel-2)] px-3 py-1.5 text-white"
                : "rounded-lg px-3 py-1.5 text-zinc-400 hover:text-zinc-100"
            }
          >
            {f}
          </button>
        ))}
      </div>
      {assets.length === 0 ? (
        <EmptyState text="暂无相关资产" />
      ) : (
        <div className="grid grid-cols-4 gap-4 px-6">
          {assets.map((a) => (
            <img key={a.id} src={a.url} alt={a.id} loading="lazy" className="aspect-[3/4] rounded-xl object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}
