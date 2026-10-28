export default function HomePage() {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-semibold">AI 创作 Demo</h1>
        <p className="mb-8 text-sm text-zinc-400">千问创作核心链路的最小复刻：模型路由 · 异步任务 · 资产入库</p>
        <a href="/gen" className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm">
          进入 AI 生成
        </a>
      </div>
    </div>
  );
}
