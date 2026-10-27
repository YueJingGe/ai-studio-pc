import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { GenForm } from "../src/features/gen-image/GenForm";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("GenForm（组件测试 + MSW）", () => {
  it("prompt 为空时禁用立即生成；输入后可编辑并提交创建任务", async () => {
    const onCreated = vi.fn();
    wrap(<GenForm onCreated={onCreated} />);

    await waitFor(() => expect(screen.getByText(/Qwen-Image 3.0/)).toBeTruthy(), { timeout: 5000 });
    const btn = screen.getByRole("button", { name: "立即生成" });
    expect(btn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("输入你的要求，AI生成图片"), { target: { value: "一只猫" } });
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("t1"));
  });
});
