import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { Menu } from "../../components/Menu";
import { api } from "../../services/api";
import { useGenDraft } from "../../stores/genDraft";

export function ModelSelect() {
  const { data } = useQuery({ queryKey: ["models"], queryFn: () => api.models() });
  const models = (data?.models ?? []).filter((m) => m.type === "image");
  const { modelKey, set } = useGenDraft();

  useEffect(() => {
    if (!modelKey && models.length > 0) {
      const first = models[0];
      if (first) set({ modelKey: first.modelKey, size: first.params.sizes[0] ?? "1K", ratio: first.params.ratios[0] ?? "原始" });
    }
  }, [models, modelKey, set]);

  const current = models.find((m) => m.modelKey === modelKey) ?? models[0];

  return (
    <Menu
      width={300}
      trigger={() => (
        <span className="flex w-full items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold">
            M
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm text-zinc-100">
              <span className="truncate">{current?.name ?? "加载中…"}</span>
              {current?.tag ? (
                <em className="not-italic rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300">{current.tag}</em>
              ) : null}
            </span>
            <span className="block truncate text-xs text-zinc-500">{current?.desc ?? ""}</span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-zinc-500" />
        </span>
      )}
      items={models.map((m) => ({ key: m.modelKey, label: m.tag ? `${m.name}（${m.tag}）` : m.name }))}
      value={current?.modelKey}
      onSelect={(k) => {
        const m = models.find((x) => x.modelKey === k);
        set({ modelKey: k, size: m?.params.sizes[0] ?? "1K", ratio: m?.params.ratios[0] ?? "原始" });
      }}
    />
  );
}
