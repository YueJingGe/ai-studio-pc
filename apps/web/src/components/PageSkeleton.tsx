export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-8" aria-busy="true" aria-label="页面加载中">
      <div className="h-8 w-40 rounded bg-[var(--panel-2)]" />
      <div className="h-64 rounded-2xl bg-[var(--panel)]" />
    </div>
  );
}
