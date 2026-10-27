import { vi } from "vitest";
import { MOCK_MODEL, makeTask } from "./fixtures";

/**
 * 组件测试的确定性 fetch stub。
 * 说明：msw/node 无法拦截 happy-dom 自实现 fetch（ADR-004 修订），
 * 组件层改用显式 stub；msw 保留给 node 环境（P4）测试使用。
 */
export function installFetchMock() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

    if (method === "GET" && url.endsWith("/api/models")) return json({ models: [MOCK_MODEL] });
    if (method === "GET" && url.includes("/api/tasks")) return json({ tasks: [] });
    if (method === "POST" && url.endsWith("/api/tasks")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as { prompt?: string };
      return json({ task: makeTask({ prompt: body.prompt ?? "" }) }, 202);
    }
    return json({ code: "NOT_FOUND", message: `no route: ${method} ${url}`, requestId: "test" }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
