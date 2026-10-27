import { SlidersHorizontal } from "lucide-react";
import type { ModelInfo } from "@ai-studio/contracts";
import { Menu } from "../../components/Menu";
import { useGenDraft } from "../../stores/genDraft";

export function ParamBar({ model }: { model?: ModelInfo }) {
  const { size, ratio, count, set } = useGenDraft();
  const sizes = model?.params.sizes ?? ["1K"];
  const ratios = model?.params.ratios ?? ["原始"];
  const maxCount = model?.params.maxCount ?? 4;

  const btn = (label: string) => (
    <span className="rounded px-1.5 py-1 text-zinc-300 transition-colors hover:bg-[var(--panel-2)] hover:text-white">{label}</span>
  );

  return (
    <div className="flex items-center gap-0.5 text-xs">
      <SlidersHorizontal size={14} className="mr-1 text-zinc-500" />
      <Menu trigger={() => btn(size)} items={sizes.map((s) => ({ key: s, label: s }))} value={size} onSelect={(k) => set({ size: k })} width={96} />
      <span className="text-zinc-600">·</span>
      <Menu trigger={() => btn(ratio)} items={ratios.map((r) => ({ key: r, label: r }))} value={ratio} onSelect={(k) => set({ ratio: k })} width={96} />
      <span className="text-zinc-600">·</span>
      <Menu
        trigger={() => btn(String(count))}
        items={Array.from({ length: maxCount }, (_, i) => ({ key: String(i + 1), label: String(i + 1) }))}
        value={String(count)}
        onSelect={(k) => set({ count: Number(k) })}
        width={72}
      />
    </div>
  );
}
