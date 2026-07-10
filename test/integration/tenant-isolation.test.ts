import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * The single most security-critical property in a multi-tenant app: a query
 * scoped to org A must never return org B's rows, no matter what id an
 * attacker (or a bug) supplies. This spins up a disposable SQLite file,
 * applies the real migrations to it, and seeds two organizations by hand so
 * every assertion below is against real Prisma queries — not mocks.
 */

const TEST_DB_PATH = path.resolve(__dirname, "../tenant-isolation.test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

let prisma: PrismaClient;
let orgA: { id: string };
let orgB: { id: string };
let ticketA: { id: string };
let ticketB: { id: string };

/**
 * Best-effort file cleanup. On Windows, SQLite can hold the file handle open
 * briefly after `$disconnect()` resolves — deleting it is a courtesy, not a
 * correctness requirement (the next run's `beforeAll` clears it anyway), so
 * a lingering handle must never fail the suite.
 */
function cleanupTestDb(): void {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    try {
      if (fs.existsSync(TEST_DB_PATH + suffix)) fs.rmSync(TEST_DB_PATH + suffix);
    } catch {
      // Ignore — see doc comment above.
    }
  }
}

beforeAll(async () => {
  cleanupTestDb();

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: "pipe",
  });

  prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: TEST_DB_URL }) });

  orgA = await prisma.organization.create({ data: { name: "Org A", slug: "org-a-test" } });
  orgB = await prisma.organization.create({ data: { name: "Org B", slug: "org-b-test" } });

  const [userA, userB] = await Promise.all([
    prisma.user.create({
      data: { name: "Agent A", email: "agent-a@test.com", role: "AGENT", orgId: orgA.id },
    }),
    prisma.user.create({
      data: { name: "Agent B", email: "agent-b@test.com", role: "AGENT", orgId: orgB.id },
    }),
  ]);

  const [contactA, contactB] = await Promise.all([
    prisma.contact.create({
      data: { orgId: orgA.id, name: "Customer A", email: "customer-a@test.com" },
    }),
    prisma.contact.create({
      data: { orgId: orgB.id, name: "Customer B", email: "customer-b@test.com" },
    }),
  ]);

  [ticketA, ticketB] = await Promise.all([
    prisma.ticket.create({
      data: {
        orgId: orgA.id,
        number: 1,
        subject: "Org A's private ticket",
        body: "Only Org A should ever see this.",
        contactId: contactA.id,
        assigneeId: userA.id,
      },
    }),
    prisma.ticket.create({
      data: {
        orgId: orgB.id,
        number: 1,
        subject: "Org B's private ticket",
        body: "Only Org B should ever see this.",
        contactId: contactB.id,
        assigneeId: userB.id,
      },
    }),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
  cleanupTestDb();
});

describe("tenant isolation", () => {
  it("a ticket list scoped to org A never includes org B's tickets", async () => {
    const orgATickets = await prisma.ticket.findMany({ where: { orgId: orgA.id } });
    expect(orgATickets).toHaveLength(1);
    expect(orgATickets[0]?.id).toBe(ticketA.id);
    expect(orgATickets.some((t) => t.id === ticketB.id)).toBe(false);
  });

  it("looking up org B's ticket id while scoped to org A returns nothing", async () => {
    // This is exactly the DAL pattern used throughout the app:
    // `findFirst({ where: { id, orgId } })` — the id alone is not enough.
    const result = await prisma.ticket.findFirst({
      where: { id: ticketB.id, orgId: orgA.id },
    });
    expect(result).toBeNull();
  });

  it("contacts are isolated the same way", async () => {
    const orgAContacts = await prisma.contact.findMany({ where: { orgId: orgA.id } });
    expect(orgAContacts).toHaveLength(1);
    expect(orgAContacts[0]?.email).toBe("customer-a@test.com");
  });

  it("members are isolated the same way", async () => {
    const orgAUsers = await prisma.user.findMany({ where: { orgId: orgA.id } });
    expect(orgAUsers).toHaveLength(1);
    expect(orgAUsers[0]?.email).toBe("agent-a@test.com");
  });

  it("per-org ticket numbering can collide across orgs without conflict (both are #1)", async () => {
    expect(ticketA.id).not.toBe(ticketB.id);
    const [a, b] = await Promise.all([
      prisma.ticket.findUnique({ where: { orgId_number: { orgId: orgA.id, number: 1 } } }),
      prisma.ticket.findUnique({ where: { orgId_number: { orgId: orgB.id, number: 1 } } }),
    ]);
    expect(a?.id).toBe(ticketA.id);
    expect(b?.id).toBe(ticketB.id);
  });
});
