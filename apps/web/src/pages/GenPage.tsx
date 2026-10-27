import { useState } from "react";
import { Tabs } from "../components/Tabs";
import { GenForm } from "../features/gen-image/GenForm";
import { ResultsArea } from "../features/gen-image/ResultsArea";

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
        {tab === "image" ? <GenForm onCreated={() => undefined} /> : null}
      </section>
      <ResultsArea />
    </div>
  );
}
