import { expect, test } from "playwright/test";
import { adminCredentialsConfigured, createE2EName, loginAsAdmin, openAdminSection } from "./support/admin";

test.describe("Admin products flow", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("creates, updates, and deletes a product", async ({ page }) => {
    const initialName = createE2EName("E2E Product");
    const updatedName = `${initialName} Updated`;

    await loginAsAdmin(page);
    await openAdminSection(page, "/admin/products", "المنتجات");

    await page.getByTestId("products-add-button").click();
    await expect(page.getByTestId("product-form-modal")).toBeVisible();

    await page.getByTestId("product-name-input").fill(initialName);
    await page.getByTestId("product-price-input").fill("1990");
    await page.getByTestId("product-stock-input").fill("7");
    await page.getByTestId("product-save-button").click();

    await expect(page.getByTestId("product-form-modal")).not.toBeVisible();

    const searchInput = page.getByTestId("products-search-input");
    await searchInput.fill(initialName);
    await expect(page.getByText(initialName)).toBeVisible();

    const productRow = page.locator("tr", { hasText: initialName }).first();
    await productRow.getByTitle("تعديل").click();
    await expect(page.getByTestId("product-form-modal")).toBeVisible();

    await page.getByTestId("product-name-input").fill(updatedName);
    await page.getByTestId("product-stock-input").fill("9");
    await page.getByTestId("product-save-button").click();
    await expect(page.getByTestId("product-form-modal")).not.toBeVisible();

    await searchInput.fill(updatedName);
    await expect(page.getByText(updatedName)).toBeVisible();

    const updatedRow = page.locator("tr", { hasText: updatedName }).first();
    await updatedRow.getByTitle("حذف").click();
    await page.getByTestId("product-delete-confirm").click();

    await expect(page.getByText(updatedName)).not.toBeVisible();
  });
});
