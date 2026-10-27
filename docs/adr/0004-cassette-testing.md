# ADR-004 外部 API 记录回放测试
DashScope 真实响应录制为 cassette 入库（录制时 mask 密钥头），CI/本地回放保证确定性；无 key 可跑。
真实链路 eval 放 nightly，不阻塞 CI。P1 先落 mock 集成测试，cassette 机制 M4 接入。
