import { test } from "playwright/test";
import { adminCredentialsConfigured, loginAsAdmin, openAdminSection } from "./support/admin";

test.describe("Admin navigation smoke", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("opens critical admin sections", async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminSection(page, "/admin/orders", "الطلبات");
    await openAdminSection(page, "/admin/products", "المنتجات");
    await openAdminSection(page, "/admin/categories", "التصنيفات");
  });
});
