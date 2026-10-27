import { expect, test } from "@playwright/test";

test("导航与 AI 生成页骨架渲染", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "AI生成" })).toBeVisible();

  await page.getByRole("link", { name: "AI生成" }).click();
  await expect(page.getByRole("tab", { name: /图片生成/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /视频生成/ })).toBeVisible();
  await expect(page.getByText("待开发").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "全部" })).toBeVisible();

  await page.getByRole("link", { name: "资产" }).click();
  await expect(page.getByRole("heading", { name: "资产" })).toBeVisible();
});
