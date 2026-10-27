import { fireEvent, render, screen } from "@testing-library/react";
import type { TaskView } from "@ai-studio/contracts";
import { describe, expect, it, vi } from "vitest";
import { TaskCard } from "../src/features/gen-image/TaskCard";

const base: TaskView = {
  id: "abcdef12-3456",
  modelKey: "qwen-image-mock",
  status: "succeeded",
  prompt: "一只猫",
  params: { size: "1K", ratio: "1:1", count: 2 },
  refImages: [],
  outputs: ["/static/mock/mock-1.svg", "/static/mock/mock-2.svg"],
  credit: 2,
  error: null,
  createdAt: 0,
  updatedAt: 0,
};

describe("TaskCard 状态机渲染", () => {
  it("成功态渲染结果图与参数回显", () => {
    render(<TaskCard task={base} />);
    expect(screen.getByText("已成功")).toBeTruthy();
    expect(screen.getByText("1K · 1:1 · ×2")).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("失败态显示错误与重试按钮", () => {
    const onRetry = vi.fn();
    render(<TaskCard task={{ ...base, status: "failed", error: "boom", outputs: [] }} onRetry={onRetry} />);
    expect(screen.getByText("失败")).toBeTruthy();
    expect(screen.getByText("boom")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /重试/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("排队/生成中态渲染占位", () => {
    const { unmount } = render(<TaskCard task={{ ...base, status: "pending", outputs: [] }} />);
    expect(screen.getByText("排队中")).toBeTruthy();
    unmount();
    render(<TaskCard task={{ ...base, status: "running", outputs: [] }} />);
    expect(screen.getByText("生成中")).toBeTruthy();
  });
});
