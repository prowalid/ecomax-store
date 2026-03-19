import { expect, test } from "playwright/test";

test.describe("Storefront smoke", () => {
  test("renders the storefront home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("الأكثر طلبا")).toBeVisible();
    await expect(page.getByText("الأكثر مبيعاً")).toBeVisible();
  });

  test("opens the admin login page", async ({ page }) => {
    await page.goto("/admin/login");

    await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
    await expect(page.locator("#admin-login-username")).toBeVisible();
    await expect(page.locator("#admin-login-password")).toBeVisible();
    await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();
  });
});
