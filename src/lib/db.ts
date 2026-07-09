import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { env } from "@/env";
import { resolveLibsqlConnection } from "@/lib/db-url";

/**
 * Prisma client, connected through the libSQL driver adapter. One code path for
 * a local SQLite file and a remote Turso database. Cached on `globalThis` in dev
 * so Fast Refresh doesn't exhaust connections.
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaLibSql(
    resolveLibsqlConnection(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN),
  );
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
