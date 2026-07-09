import "server-only";
import { prisma } from "@/lib/db";

export interface SearchResult {
  tickets: Array<{ id: string; subject: string; number: number }>;
  contacts: Array<{ id: string; name: string; email: string }>;
}

/**
 * Perform a fast, limited global search across tickets and contacts for the command palette.
 */
export async function globalSearch(
  orgId: string,
  query: string
): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return { tickets: [], contacts: [] };
  }

  // Run in parallel
  const [tickets, contacts] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        orgId,
        deletedAt: null,
        OR: [
          { subject: { contains: query } },
          { body: { contains: query } },
        ],
      },
      select: {
        id: true,
        subject: true,
        number: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.findMany({
      where: {
        orgId,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { tickets, contacts };
}
