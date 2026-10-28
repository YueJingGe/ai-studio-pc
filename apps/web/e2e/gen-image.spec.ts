import { expect, test } from "@playwright/test";

test("图片生成全链路（mock provider）", async ({ page }) => {
  // 冷启动竞态防护：先等 server 就绪再进页面
  await expect
    .poll(async () => {
      try {
        return (await page.request.get("http://127.0.0.1:8787/api/health")).ok();
      } catch {
        return false;
      }
    }, { timeout: 30000 })
    .toBe(true);
  await page.goto("/gen");

  // 模型选择器加载注册表
  await expect(page.getByText("Qwen-Image 3.0（Mock）").first()).toBeVisible();

  // 提交前禁用
  const submitBtn = page.getByRole("button", { name: "立即生成" });
  await expect(submitBtn).toBeDisabled();

  const prompt = `E2E 一只猫 ${Date.now()}`;
  await page.getByPlaceholder("输入你的要求，AI生成图片").fill(prompt);
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // 任务卡出现并流转到成功
  const card = page.getByLabel(/任务 /).filter({ hasText: prompt });
  await expect(card).toBeVisible();
  await expect(card.getByText("已成功", { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(card.getByRole("img").first()).toBeVisible();
  await expect(card.getByRole("link", { name: "下载" })).toBeVisible();
});
