import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Runs against the dev server (fast start, adequate fidelity for
 * a trial submission's CI budget — a `next build && next start` run is the
 * documented alternative in docs/testing.md for a pre-deploy smoke check).
 * `globalSetup` reseeds the database so every run starts from the same
 * known state — tests that create data don't need their own cleanup.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // shared seeded DB — avoid cross-test data races
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // The suite reuses a handful of seeded accounts across many specs, all
    // against one server process's in-memory rate limiter — see rate-limit.ts.
    env: { E2E_TESTING: "1" },
  },
});
