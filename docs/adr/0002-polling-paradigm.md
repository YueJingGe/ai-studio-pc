# ADR-002 异步任务轮询范式
站点 bundle 无 WebSocket/EventSource 签名 → 任务制轮询。前端采用 TanStack Query 官方范式：
refetchInterval: (query) => 终态 ? false : backoff(attempts)，标签页隐藏自动暂停。
backoff 为纯函数（1s→2s→4s→8s 封顶），单测覆盖。
