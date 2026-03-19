import { expect, test } from "playwright/test";
import { adminCredentialsConfigured, createE2EName, loginAsAdmin, openAdminSection } from "./support/admin";

test.describe("Admin categories flow", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("creates and deletes a category", async ({ page }) => {
    const categoryName = createE2EName("E2E Category");

    await loginAsAdmin(page);
    await openAdminSection(page, "/admin/categories", "التصنيفات");

    await page.getByTestId("categories-add-button").click();
    await page.getByTestId("category-name-input").fill(categoryName);
    await page.getByTestId("category-save-button").click();

    const categoryRow = page.locator("[data-testid^='category-row-']", { hasText: categoryName }).first();
    await expect(categoryRow).toBeVisible();

    await categoryRow.getByRole("button").last().click();
    await expect(categoryRow).not.toBeVisible();
  });
});
