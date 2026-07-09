import path from "node:path";

export interface LibsqlConnection {
  url: string;
  authToken?: string;
}

/**
 * Resolve a raw `DATABASE_URL` into a libSQL connection config.
 *
 * Local `file:` URLs are rewritten to an absolute path under `prisma/` so the
 * runtime client and the Prisma CLI (which resolves relative to the schema dir)
 * open the exact same database file. Remote `libsql://` URLs (Turso) pass
 * through with their auth token.
 *
 * Shared by `src/lib/db.ts` (runtime) and `prisma.config.ts` (migrations).
 */
export function resolveLibsqlConnection(
  rawUrl: string,
  authToken?: string,
): LibsqlConnection {
  if (rawUrl.startsWith("file:")) {
    const rel = rawUrl.slice("file:".length).replace(/^\.?\//, "");
    const abs = path.resolve(process.cwd(), "prisma", rel).replace(/\\/g, "/");
    return { url: `file:${abs}` };
  }
  return { url: rawUrl, authToken: authToken || undefined };
}
