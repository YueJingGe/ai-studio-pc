import { Sparkles } from "lucide-react";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid place-items-center gap-3 py-24 text-zinc-500">
      <Sparkles size={36} strokeWidth={1.2} />
      <p className="text-sm">{text}</p>
    </div>
  );
}
