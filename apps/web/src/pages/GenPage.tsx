import { useState } from "react";
import type { TaskView } from "@ai-studio/contracts";
import { Tabs } from "../components/Tabs";
import { GenForm } from "../features/gen-image/GenForm";
import { ResultsArea } from "../features/gen-image/ResultsArea";
import { useGenDraft } from "../stores/genDraft";

const TABS = [
  { key: "image", label: "图片生成" },
  { key: "video", label: "视频生成", disabled: true, badge: "待开发" },
  { key: "edit", label: "视频编辑", disabled: true, badge: "待开发" },
];

export default function GenPage() {
  const [tab, setTab] = useState("image");
  const setDraft = useGenDraft((s) => s.set);

  function editTask(t: TaskView) {
    setDraft({
      prompt: t.prompt,
      modelKey: t.modelKey,
      size: t.params.size,
      ratio: t.params.ratio,
      count: t.params.count,
      refImages: t.refImages,
    });
  }

  return (
    <div className="flex h-full">
      <section aria-label="生成表单" className="flex w-[420px] shrink-0 flex-col border-r border-[var(--line)]">
        <Tabs items={TABS} value={tab} onChange={setTab} />
        {tab === "image" ? <GenForm onCreated={() => undefined} /> : null}
      </section>
      <ResultsArea onEdit={editTask} />
    </div>
  );
}
