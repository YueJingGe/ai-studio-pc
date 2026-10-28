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
    <div>
      {refImages.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {refImages.map((url, i) => (
            <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--line)]">
              <img src={url} alt={`参考图${i + 1}`} className="h-full w-full object-cover" />
              <button
                aria-label={`移除参考图${i + 1}`}
                onClick={() => set({ refImages: refImages.filter((_, idx) => idx !== i) })}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded bg-black/60 text-zinc-200 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || refImages.length >= 4}
        className="grid h-28 w-full place-items-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-50"
      >
        <span className="flex flex-col items-center gap-2 text-sm">
          <Plus size={18} />
          {uploading ? "上传中…" : "上传参考内容"}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple hidden onChange={(e) => void onFiles(e.target.files)} />
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
