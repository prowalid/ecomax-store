import { expect, test } from "playwright/test";
import { adminCredentialsConfigured, createE2EName, loginAsAdmin, openAdminSection } from "./support/admin";

test.describe("Admin pages flow", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("creates, updates, and deletes a page", async ({ page }) => {
    const initialTitle = createE2EName("E2E Page");
    const updatedTitle = `${initialTitle} Updated`;

    await loginAsAdmin(page);
    await openAdminSection(page, "/admin/pages", "صفحات المتجر");

    await page.getByTestId("pages-add-button").click();
    await page.getByTestId("page-title-input").fill(initialTitle);
    await page.getByTestId("page-slug-input").fill(`e2e-page-${Date.now()}`);
    await page.getByTestId("page-create-button").click();

    const createdRow = page.locator("[data-testid^='page-row-']", { hasText: initialTitle }).first();
    await expect(createdRow).toBeVisible();

    await createdRow.getByTestId(/page-edit-/).click();
    await expect(page.getByTestId("page-editor-modal")).toBeVisible();
    await page.getByTestId("page-edit-title-input").fill(updatedTitle);
    await page.getByTestId("page-save-button").click();
    await expect(page.getByTestId("page-editor-modal")).not.toBeVisible();

    const updatedRow = page.locator("[data-testid^='page-row-']", { hasText: updatedTitle }).first();
    await expect(updatedRow).toBeVisible();

    await updatedRow.getByTestId(/page-delete-/).click();
    await page.getByTestId("page-delete-confirm").click();
    await expect(updatedRow).not.toBeVisible();
  });
});
