import type { Page } from "@playwright/test";

export const DEMO_USERS = {
  admin: { email: "demo@deskly.app", password: "demo1234" },
  owner: { email: "owner@deskly.app", password: "demo1234" },
  viewer: { email: "viewer@deskly.app", password: "demo1234" },
} as const;

/**
 * Logs in and confirms the session actually stuck by polling `/dashboard`
 * rather than trusting a single fixed delay — a cold Turbopack compile of a
 * just-visited route can take several seconds and a flat wait races it.
 */
export async function login(
  page: Page,
  user: { email: string; password: string } = DEMO_USERS.admin,
): Promise<void> {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  for (let attempt = 0; attempt < 5; attempt++) {
    await page.waitForTimeout(1000);
    await page.goto("/dashboard", { waitUntil: "networkidle" });
    if (page.url().endsWith("/dashboard")) return;
  }
  throw new Error(`Login did not stick for ${user.email}, ended at ${page.url()}`);
}
