import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { api } from "../../services/api";
import { useGenDraft } from "../../stores/genDraft";

const TILE_GRADIENTS = [
  "from-indigo-500 to-purple-500",
  "from-sky-500 to-indigo-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
];

export function ModelSelect() {
  const { data } = useQuery({ queryKey: ["models"], queryFn: () => api.models() });
  const models = (data?.models ?? []).filter((m) => m.type === "image");
  const { modelKey, set } = useGenDraft();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!modelKey && models.length > 0) {
      const first = models[0];
      if (first) set({ modelKey: first.modelKey, size: first.params.sizes[0] ?? "1K", ratio: first.params.ratios[0] ?? "原始" });
    }
  }, [models, modelKey, set]);

  const current = models.find((m) => m.modelKey === modelKey) ?? models[0];

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl bg-[var(--panel)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--panel-2)]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold">
          {(current?.name ?? "M").slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm text-zinc-100">
            <span className="truncate">{current?.name ?? "加载中…"}</span>
            {current?.tag ? <em className="not-italic rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300">{current.tag}</em> : null}
          </span>
          <span className="block truncate text-xs text-zinc-500">{current?.desc ?? ""}</span>
        </span>
        <ChevronDown size={16} className={clsx("shrink-0 text-zinc-500 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul role="listbox" className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-1.5 shadow-2xl">
            {models.map((m, i) => (
              <li key={m.modelKey}>
                <button
                  role="option"
                  aria-selected={m.modelKey === current?.modelKey}
                  onClick={() => {
                    set({ modelKey: m.modelKey, size: m.params.sizes[0] ?? "1K", ratio: m.params.ratios[0] ?? "原始" });
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left",
                    m.modelKey === current?.modelKey ? "bg-[var(--panel)]" : "hover:bg-[var(--panel)]",
                  )}
                >
                  <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold", TILE_GRADIENTS[i % TILE_GRADIENTS.length])}>
                    {m.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm text-zinc-100">
                      <span className="truncate">{m.name}</span>
                      {m.tag ? <em className="not-italic rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300">{m.tag}</em> : null}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">{m.desc}</span>
                  </span>
                  {m.modelKey === current?.modelKey ? <Check size={16} className="shrink-0 text-zinc-100" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
