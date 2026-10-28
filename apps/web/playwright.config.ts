import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  use: { baseURL: "http://localhost:5173", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm -w dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 90000,
    // E2E 永远走 mock：dotenv 不覆盖已存在的环境变量（真实链路留给手动自测）
    env: { ...process.env, PROVIDER: "mock", CASSETTE_MODE: "off" },
  },
});
