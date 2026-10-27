import { describe, expect, it } from "vitest";
import { assertTransition, isTerminal } from "../src/engine/stateMachine.js";

describe("task state machine", () => {
  it("allows legal transitions", () => {
    expect(() => assertTransition("pending", "running")).not.toThrow();
    expect(() => assertTransition("running", "succeeded")).not.toThrow();
    expect(() => assertTransition("running", "failed")).not.toThrow();
    expect(() => assertTransition("pending", "canceled")).not.toThrow();
  });

  it("throws on illegal transitions", () => {
    expect(() => assertTransition("pending", "succeeded")).toThrow(/illegal task transition/);
    expect(() => assertTransition("succeeded", "running")).toThrow(/illegal task transition/);
    expect(() => assertTransition("failed", "running")).toThrow(/illegal task transition/);
  });

  it("recognizes terminal statuses", () => {
    expect(isTerminal("succeeded")).toBe(true);
    expect(isTerminal("failed")).toBe(true);
    expect(isTerminal("canceled")).toBe(true);
    expect(isTerminal("running")).toBe(false);
    expect(isTerminal("pending")).toBe(false);
  });
});
