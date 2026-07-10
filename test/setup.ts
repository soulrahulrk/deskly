// Minimal env so importing modules that touch `src/env.ts` doesn't throw
// during unit tests that never actually hit the database or Auth.js.
// NODE_ENV is already "test" — Vitest sets it before this file loads.
process.env.DATABASE_URL ||= "file:./test/test.db";
process.env.AUTH_SECRET ||= "test-secret-not-for-production-use-only-in-vitest";
