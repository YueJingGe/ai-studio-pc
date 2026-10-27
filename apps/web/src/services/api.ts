import type { ApiErrorEnvelope, AssetView, CreateTaskInput, ModelInfo, TaskView } from "@ai-studio/contracts";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "x-request-id": crypto.randomUUID(),
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null;
    throw new Error(body?.message ?? `请求失败: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  models: () => request<{ models: ModelInfo[] }>("/models"),
  createTask: (input: CreateTaskInput) =>
    request<{ task: TaskView }>("/tasks", { method: "POST", body: JSON.stringify(input) }),
  task: (id: string) => request<{ task: TaskView }>(`/tasks/${encodeURIComponent(id)}`),
  tasks: () => request<{ tasks: TaskView[] }>("/tasks"),
  assets: (type?: string) =>
    request<{ assets: AssetView[] }>(`/assets${type ? `?type=${encodeURIComponent(type)}` : ""}`),
  upload: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/uploads`, { method: "POST", body: form, headers: { "x-request-id": crypto.randomUUID() } });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null;
      throw new Error(body?.message ?? `上传失败: ${res.status}`);
    }
    return (await res.json()) as { url: string };
  },
};
