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
  credit: 0,
  error: null,
  createdAt: 0,
  updatedAt: 0,
};

describe("TaskCard 状态机渲染", () => {
  it("成功态渲染结果图/头部信息行/下载按钮", () => {
    render(<TaskCard task={base} />);
    expect(screen.getByText("已成功")).toBeTruthy();
    expect(screen.getByText("一只猫")).toBeTruthy();
    expect(screen.getByText("1:1")).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByLabelText("下载")).toBeTruthy();
  });

  it("失败态显示错误与再次生成", () => {
    const onRegenerate = vi.fn();
    render(<TaskCard task={{ ...base, status: "failed", error: "boom", outputs: [] }} onRegenerate={onRegenerate} />);
    expect(screen.getByText("失败")).toBeTruthy();
    expect(screen.getByText("boom")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /再次生成/ }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("排队态有 loading，生成中态有百分比文案", () => {
    const { unmount } = render(<TaskCard task={{ ...base, status: "pending", outputs: [] }} />);
    expect(screen.getByLabelText("排队中")).toBeTruthy();
    unmount();
    render(<TaskCard task={{ ...base, status: "running", outputs: [] }} />);
    expect(screen.getByLabelText("生成中")).toBeTruthy();
    expect(screen.getByText("AI加速绘图中...")).toBeTruthy();
  });

  it("重新编辑回显回调", () => {
    const onEdit = vi.fn();
    render(<TaskCard task={base} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: /重新编辑/ }));
    expect(onEdit).toHaveBeenCalledWith(base);
  });
});
