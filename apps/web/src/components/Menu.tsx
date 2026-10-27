import { useState, type ReactNode } from "react";
import clsx from "clsx";

export interface MenuItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export function Menu({
  trigger,
  items,
  value,
  onSelect,
  width = 176,
}: {
  trigger: (open: boolean) => ReactNode;
  items: MenuItem[];
  value?: string;
  onSelect: (key: string) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {trigger(open)}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            style={{ width }}
            className="absolute z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-[var(--line)] bg-[var(--panel-2)] py-1 shadow-2xl"
          >
            {items.map((it) => (
              <button
                key={it.key}
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  onSelect(it.key);
                  setOpen(false);
                }}
                className={clsx(
                  "block w-full px-3 py-2 text-left text-sm",
                  value === it.key ? "bg-[var(--panel)] text-white" : "text-zinc-300 hover:bg-[var(--panel)] hover:text-white",
                  it.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
