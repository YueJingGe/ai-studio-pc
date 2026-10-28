# ai-studio-pc

AI 创作核心链路的最小 demo：模型路由 + 异步任务状态机 + 资产入库。

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

## M4 真实链路自测手册（key 由使用者自持，Codex 不调用）
1. **配置**：`apps/server/.env`
   - `DASHSCOPE_API_KEY=sk-...`（百炼控制台 API-KEY，非 RAM AccessKey）
   - `PROVIDER=dashscope`（手动自测时）；`DASHSCOPE_IMAGE_MODEL=<控制台模型广场的模型ID>`（若报 `Model not exist`，把控制台里图片生成模型的 ID 填进来）
2. **UI 真出图**：`pnpm dev` → http://localhost:5173/gen → 输入 prompt → 立即生成（消耗百炼额度）
3. **curl 真出图**：
   ```bash
   curl -s -X POST localhost:8787/api/tasks -H 'content-type: application/json' \
     -d '{"modelKey":"qwen-image-mock","prompt":"一只猫","params":{"size":"1K","ratio":"1:1","count":1}}'
   # 轮询
   curl -s localhost:8787/api/tasks/<taskId>
   ```
4. **录制 cassette**（一次真实调用，之后永久确定性回放）：
   ```bash
   pnpm --filter @ai-studio/server record:cassette
   # 录完后把 .env 的 CASSETTE_MODE 改为 replay，pnpm test 将启用回放契约测试（无需 key）
   ```
   cassette 仅存请求体/响应 JSON/图片 base64；**Authorization 等密钥头永不落盘**。
5. **E2E 永远 mock**：playwright webServer 注入 `PROVIDER=mock`（dotenv 不覆盖已存在环境变量），真实链路不进入自动化。
