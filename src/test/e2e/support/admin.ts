import { expect, type Page } from "playwright/test";

export const adminPhone = process.env.E2E_ADMIN_PHONE;
export const adminPassword = process.env.E2E_ADMIN_PASSWORD;

export function adminCredentialsConfigured() {
  return Boolean(adminPhone && adminPassword);
}

export async function loginAsAdmin(page: Page) {
  if (!adminCredentialsConfigured()) {
    throw new Error("E2E admin credentials are not configured.");
  }

  await page.goto("/admin/login");
  await page.locator("#admin-login-username").fill(adminPhone!);
  await page.locator("#admin-login-password").fill(adminPassword!);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL(/\/admin(?:\/)?$/);
  await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
}

export async function openAdminSection(page: Page, href: string, heading: string) {
  await page.goto(href);
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
}

export function createE2EName(prefix: string) {
  return `${prefix} ${Date.now()}`;
}
