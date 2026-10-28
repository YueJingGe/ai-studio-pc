import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { ModelInfo } from "@ai-studio/contracts";
import clsx from "clsx";
import { useGenDraft } from "../../stores/genDraft";

function RatioIcon({ ratio }: { ratio: string }) {
  if (ratio === "原始") return <span className="grid h-4 w-4 place-items-center rounded-[3px] border border-current text-[8px]">原</span>;
  const [w, h] = ratio.split(":").map(Number);
  const style = w && h ? { aspectRatio: `${w} / ${h}` } : undefined;
  return <span className="block h-4 rounded-[3px] border border-current" style={{ ...style, width: w && h && w > h ? 18 : undefined, maxWidth: 18, minWidth: 10 }} />;
}

export function ParamPanel({ model }: { model?: ModelInfo }) {
  const { size, ratio, count, set } = useGenDraft();
  const [open, setOpen] = useState(false);
  const sizes = model?.params.sizes ?? ["1K"];
  const ratios = model?.params.ratios ?? ["原始"];
  const maxCount = model?.params.maxCount ?? 4;

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-[var(--panel-2)] px-3 py-2 text-xs text-zinc-200 transition-colors hover:text-white"
      >
        <SlidersHorizontal size={14} className="text-zinc-400" />
        {size} · {ratio} · {count}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-label="生成参数" className="absolute bottom-full z-20 mb-2 w-72 rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-4 shadow-2xl">
            <p className="mb-2 text-xs text-zinc-400">分辨率</p>
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-[var(--panel)] p-1">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => set({ size: s })}
                  className={clsx("rounded-md py-1.5 text-sm", size === s ? "bg-[var(--panel-2)] text-white" : "text-zinc-400 hover:text-zinc-100")}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mb-2 text-xs text-zinc-400">比例</p>
            <div className="mb-4 grid grid-cols-7 gap-1 rounded-lg bg-[var(--panel)] p-1">
              {ratios.map((r) => (
                <button
                  key={r}
                  onClick={() => set({ ratio: r })}
                  className={clsx("flex flex-col items-center gap-1 rounded-md py-1.5 text-[10px]", ratio === r ? "bg-[var(--panel-2)] text-white" : "text-zinc-400 hover:text-zinc-100")}
                >
                  <RatioIcon ratio={r} />
                  {r}
                </button>
              ))}
            </div>
            <p className="mb-2 text-xs text-zinc-400">生成数量</p>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-[var(--panel)] p-1">
              {Array.from({ length: maxCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => set({ count: i + 1 })}
                  className={clsx("rounded-md py-1.5 text-sm", count === i + 1 ? "bg-[var(--panel-2)] text-white" : "text-zinc-400 hover:text-zinc-100")}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
