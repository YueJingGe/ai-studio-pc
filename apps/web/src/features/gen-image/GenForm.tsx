import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../services/api";
import { useGenDraft } from "../../stores/genDraft";
import { ModelSelect } from "./ModelSelect";
import { ParamPanel } from "./ParamPanel";
import { RefImageUpload } from "./RefImageUpload";

export function GenForm({ onCreated }: { onCreated: (taskId: string) => void }) {
  const { data } = useQuery({ queryKey: ["models"], queryFn: () => api.models() });
  const queryClient = useQueryClient();
  const draft = useGenDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = (data?.models ?? []).find((m) => m.modelKey === draft.modelKey && m.type === "image");
  const canSubmit = !!model && draft.prompt.trim().length > 0 && !submitting;

  async function submit() {
    if (!canSubmit || !model) return;
    setSubmitting(true);
    setError(null);
    try {
      const { task } = await api.createTask({
        modelKey: model.modelKey,
        prompt: draft.prompt.trim(),
        params: { size: draft.size, ratio: draft.ratio, count: draft.count },
        refImages: draft.refImages.length > 0 ? draft.refImages : undefined,
      });
      onCreated(task.id);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      useGenDraft.getState().set({ prompt: "", refImages: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
      <ModelSelect />
      <RefImageUpload />
      <textarea
        value={draft.prompt}
        onChange={(e) => draft.set({ prompt: e.target.value })}
        placeholder="输入你的要求，AI生成图片"
        aria-label="生成提示词"
        className="min-h-40 flex-1 resize-none bg-transparent p-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="mt-auto flex items-center gap-2">
        <ParamPanel model={model} />
      </div>
      <button
        onClick={() => void submit()}
        disabled={!canSubmit}
        className="rounded-xl bg-white py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:bg-[var(--panel-2)] disabled:text-zinc-500 disabled:opacity-100"
      >
        {submitting ? "提交中…" : "立即生成"}
      </button>
    </div>
  );
}
