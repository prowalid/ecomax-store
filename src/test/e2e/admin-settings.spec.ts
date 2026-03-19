import { expect, test } from "playwright/test";
import { adminCredentialsConfigured, createE2EName, loginAsAdmin, openAdminSection } from "./support/admin";

test.describe("Admin settings flow", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("updates and persists general settings", async ({ page }) => {
    const metaTitle = createE2EName("E2E Store Title");

    await loginAsAdmin(page);
    await openAdminSection(page, "/admin/settings", "الإعدادات");

    await page.getByTestId("settings-meta-title-input").fill(metaTitle);
    await page.getByTestId("settings-save-button").click();
    await expect(page.getByText("تم الحفظ")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("settings-meta-title-input")).toHaveValue(metaTitle);
  });
});
