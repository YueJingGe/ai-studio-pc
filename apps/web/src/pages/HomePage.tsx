export default function HomePage() {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-semibold">AI 创作 Demo</h1>
        <a href="/gen" className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm">
          进入 AI 生成
        </a>
      </div>
    </div>
  );
}
