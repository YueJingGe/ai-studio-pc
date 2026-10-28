# ADR-004 外部 API 记录回放测试
DashScope 真实响应录制为 cassette 入库（录制时 mask 密钥头），CI/本地回放保证确定性；无 key 可跑。
真实链路 eval 放 nightly，不阻塞 CI。P1 先落 mock 集成测试，cassette 机制 M4 接入。

## 修订（2026-10-28）
- 组件测试 mock 层：MSW → **确定性 fetch stub**（tests/fetchMock.ts）。原因：msw/node 无法拦截 happy-dom 自实现 fetch；MSW 依赖保留给 node 环境测试。
- cassette 增加 meta.json 记录录制时模型 ID，replay 测试据此对齐请求哈希；blob（图片 base64）随 entry 存储。
- 真实调用纪律：自动化（E2E/CI）强制 mock；record 与手动自测由使用者持 key 执行。
