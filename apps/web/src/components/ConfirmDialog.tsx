export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-80 rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-5 shadow-2xl">
        <h3 className="mb-2 text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="mb-4 text-xs leading-5 text-zinc-400">{description}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg bg-[var(--panel)] px-3 py-1.5 text-sm text-zinc-300 hover:text-white">
            取消
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-red-500/90 px-3 py-1.5 text-sm text-white hover:bg-red-500">
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
