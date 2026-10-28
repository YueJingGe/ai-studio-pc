import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../../services/api";
import { useGenDraft } from "../../stores/genDraft";

export function RefImageUpload() {
  const { refImages, set } = useGenDraft();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await api.upload(file);
        urls.push(res.url);
      }
      set({ refImages: [...useGenDraft.getState().refImages, ...urls].slice(0, 4) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl bg-[var(--panel)] p-2">
      {refImages.length === 0 ? (
        <label
          htmlFor="ref-upload-input"
          className="grid h-28 w-full cursor-pointer place-items-center rounded-lg border border-dashed border-[var(--line)] text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          <span className="flex flex-col items-center gap-2 text-sm">
            <Plus size={18} />
            {uploading ? "上传中…" : "上传参考内容"}
          </span>
        </label>
      ) : (
        <div className="flex flex-wrap gap-2">
          {refImages.map((url, i) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--line)]">
              <img src={url} alt={`参考图${i + 1}`} className="h-full w-full object-cover" />
              <button
                aria-label={`移除参考图${i + 1}`}
                onClick={() => set({ refImages: refImages.filter((_, idx) => idx !== i) })}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-zinc-200 hover:bg-black/80"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {refImages.length < 4 ? (
            <label
              htmlFor="ref-upload-input"
              aria-label="添加参考图"
              className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg bg-[var(--panel-2)] text-zinc-400 transition-colors hover:text-white"
            >
              <Plus size={18} />
            </label>
          ) : null}
        </div>
      )}
      <input id="ref-upload-input" ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple className="sr-only" onChange={(e) => void onFiles(e.target.files)} />
      {uploading && refImages.length > 0 ? <p className="mt-1 px-1 text-xs text-zinc-500">上传中…</p> : null}
      {error ? <p className="mt-1 px-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
