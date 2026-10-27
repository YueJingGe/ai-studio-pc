# ai-studio-pc

千问创作（create.qianwen.com）核心链路的最小复刻 demo：模型路由 + 异步任务状态机 + 资产入库。

## Quickstart
```bash
pnpm install
cp apps/server/.env.example apps/server/.env   # 可选；PROVIDER 默认 mock，无需 key
pnpm dev                                        # server :8787 + web :5173
open http://localhost:5173
pnpm verify                                     # lint + typecheck + 单测/集成
pnpm e2e                                        # Playwright 全链路（mock provider）
```

## 结构
- apps/web：React19 + Vite8 + TanStack Query5 + Zustand5 + Tailwind4（暗色）
- apps/server：Fastify5 + Drizzle/SQLite + Provider 适配器（mock/dashscope/comfyui 预留）
- packages/contracts：zod 接口契约（单一事实源）

## 关键约定
- key 私密性：仅 apps/server/.env（gitignore）；前端零接触；日志/cassette 脱敏
- 轮询范式：TanStack Query refetchInterval 函数式动态间隔，终态自停
- 测试先行：单测(TDD) → 集成(inject+cassette) → 组件(MSW) → E2E(Playwright)
详见 docs/adr/。
