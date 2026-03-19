import { expect, test } from "playwright/test";
import { adminCredentialsConfigured, loginAsAdmin } from "./support/admin";

test.describe("Admin login", () => {
  test.skip(!adminCredentialsConfigured(), "E2E admin credentials are not configured.");

  test("logs into the admin dashboard", async ({ page }) => {
    await loginAsAdmin(page);
  });
});
