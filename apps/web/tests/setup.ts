import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { installFetchMock } from "./fetchMock";

beforeEach(() => {
  installFetchMock();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
