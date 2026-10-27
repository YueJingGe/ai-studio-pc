import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Tabs } from "../components/Tabs";

const TABS = [
  { key: "image", label: "图片生成" },
  { key: "video", label: "视频生成", disabled: true, badge: "待开发" },
  { key: "edit", label: "视频编辑", disabled: true, badge: "待开发" },
];

export default function GenPage() {
  const [tab, setTab] = useState("image");
  return (
    <div className="flex h-full">
      <section aria-label="生成表单" className="flex w-[420px] shrink-0 flex-col border-r border-[var(--line)]">
        <Tabs items={TABS} value={tab} onChange={setTab} />
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-6 text-center text-sm text-zinc-500">
            生成表单（M3 实现：模型选择器 / 参考图上传 / prompt / 参数条 / 立即生成）
          </div>
        </div>
      </section>
      <section aria-label="生成结果" className="flex-1">
        <div className="flex gap-2 px-6 py-4 text-sm">
          {["全部", "视频", "图片"].map((f, i) => (
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
        <EmptyState text="暂无生成结果" />
      </section>
    </div>
  );
}
