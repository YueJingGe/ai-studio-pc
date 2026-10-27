import clsx from "clsx";

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  badge?: string;
}

export function Tabs({ items, value, onChange }: { items: TabItem[]; value: string; onChange: (k: string) => void }) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-[var(--line)] px-6">
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={value === t.key}
          disabled={t.disabled}
          onClick={() => onChange(t.key)}
          className={clsx(
            "-mb-px flex items-center gap-2 border-b-2 py-3 text-sm transition-colors",
            value === t.key ? "border-white text-white" : "border-transparent text-zinc-400 hover:text-zinc-100",
            t.disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {t.label}
          {t.badge ? (
            <span className="rounded bg-[var(--panel-2)] px-1.5 py-0.5 text-[10px] text-zinc-400">{t.badge}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
