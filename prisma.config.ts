import path from "node:path";
import "dotenv/config"; // Prisma 7 no longer auto-loads .env for the CLI.
import { defineConfig } from "prisma/config";
import { resolveLibsqlConnection } from "./src/lib/db-url";

// Prisma 7 moved the connection out of schema.prisma. Migrate reads the URL from
// here; the runtime client (src/lib/db.ts) connects through the libSQL adapter.
// Both resolve to the same absolute file, so dev + CLI stay in sync.
const connection = resolveLibsqlConnection(
  process.env.DATABASE_URL ?? "file:./dev.db",
  process.env.DATABASE_AUTH_TOKEN,
);

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: connection.url,
  },
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
});
