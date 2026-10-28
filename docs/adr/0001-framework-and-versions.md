# ADR-001 框架与版本决策
React 19.3 / Vite 8 / TS ^5.9 / Tailwind 4 / TanStack Query 5 / Zustand 5 / Fastify 5 / Drizzle+SQLite。
TypeScript 最新为 7.0（原生编译器），因 eslint/vitest/drizzle 工具链兼容性暂钉 ^5.9，后置评估 TS7。
UI 不引 antd：站点为深度定制暗色风格，Tailwind 自研 primitives 更还原且可控。

## 修订（2026-10-27/28）
- SQLite 驱动：better-sqlite3 → **sql.js(WASM) + drizzle sql-js**。原因：镜像包预编译 .node 在本机 dlopen 即 SIGSEGV，node-gyp make 生成空目标无法源码编译。持久化为显式 persist() 快照。
- 组件测试环境：jsdom → **happy-dom**。原因：jsdom30 依赖 undici8 与 Node22 不兼容。
