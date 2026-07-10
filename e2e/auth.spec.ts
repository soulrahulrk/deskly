import { test, expect } from "@playwright/test";
import { login, DEMO_USERS } from "./helpers";

test.describe("authentication", () => {
  test("an unauthenticated visitor is redirected to login with a callback URL", async ({
    page,
  }) => {
    await page.goto("/tickets");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Ftickets/);
  });

  test("wrong credentials show an error and leave the user on the login page", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(DEMO_USERS.admin.email);
    await page.getByLabel("Password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("correct credentials sign the user in and land on the dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("signing out clears the session and protected routes redirect again", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /demo admin/i }).click();
    await page.getByText("Sign out").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
