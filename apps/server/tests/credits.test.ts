import { describe, expect, it } from "vitest";
import { computeCredit } from "../src/engine/credits.js";

describe("computeCredit（展示层）", () => {
  it("price × count", () => {
    expect(computeCredit(1, 4)).toBe(4);
    expect(computeCredit(15, 1)).toBe(15);
    expect(computeCredit(0, 3)).toBe(0);
  });
});
