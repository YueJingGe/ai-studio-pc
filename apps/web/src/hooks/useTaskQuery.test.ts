import { describe, expect, it } from "vitest";
import { backoffInterval } from "./useTaskQuery";

describe("backoffInterval（ADR-002 轮询范式）", () => {
  it("非终态按退避递增", () => {
    expect(backoffInterval("pending", 0)).toBe(1000);
    expect(backoffInterval("pending", 1)).toBe(2000);
    expect(backoffInterval("running", 2)).toBe(4000);
  });

  it("8s 封顶", () => {
    expect(backoffInterval("running", 3)).toBe(8000);
    expect(backoffInterval("running", 10)).toBe(8000);
  });

  it("终态自停", () => {
    expect(backoffInterval("succeeded", 0)).toBe(false);
    expect(backoffInterval("failed", 5)).toBe(false);
    expect(backoffInterval("canceled", 1)).toBe(false);
  });
});
