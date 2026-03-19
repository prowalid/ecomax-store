import { expect, test } from "playwright/test";
import { adminCredentialsConfigured, loginAsAdmin, openAdminSection } from "./support/admin";

test.describe("Admin orders flow", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("opens the first order and updates its status when possible", async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminSection(page, "/admin/orders", "الطلبات");

    const rows = page.locator("[data-testid^='order-row-']");
    const count = await rows.count();

    test.skip(count === 0, "No orders are available in the current environment.");

    const firstRow = rows.first();
    await firstRow.click();
    await expect(page.getByText("محتوى الطلب")).toBeVisible();

    const confirmButton = firstRow.locator("[data-testid*='-confirmed']").first();
    const canConfirm = await confirmButton.count();

    if (canConfirm > 0) {
      await confirmButton.click();
      await expect(page.getByText("محتوى الطلب")).toBeVisible();
    }
  });
});
