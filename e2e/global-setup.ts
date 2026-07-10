import { execSync } from "node:child_process";

/**
 * Reseed the database once before the E2E suite runs, so every run starts
 * from the same known state regardless of what a previous run created.
 */
export default function globalSetup(): void {
  execSync("npm run db:seed", { stdio: "inherit" });
}
