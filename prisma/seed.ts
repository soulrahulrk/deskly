import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { resolveLibsqlConnection } from "../src/lib/db-url";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql(
    resolveLibsqlConnection(
      process.env.DATABASE_URL ?? "file:./dev.db",
      process.env.DATABASE_AUTH_TOKEN,
    ),
  ),
});

/** Deterministic PRNG (mulberry32) so the demo data is identical on every run. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260709);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const weighted = <T>(pairs: readonly (readonly [T, number])[]): T => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of pairs) {
    if ((r -= w) <= 0) return value;
  }
  return pairs[0]![0];
};
const daysAgo = (n: number, jitterHours = 0) =>
  new Date(Date.now() - n * 86_400_000 - jitterHours * 3_600_000);

const PASSWORD = "demo1234";

const CONTACTS = [
  ["Priya Nair", "priya@brightloop.io", "BrightLoop"],
  ["Marcus Feld", "marcus@nimbusretail.com", "Nimbus Retail"],
  ["Sofia Alvarez", "sofia@queststudio.co", "Quest Studio"],
  ["Devon Wright", "devon@harborhealth.org", "Harbor Health"],
  ["Aiko Tanaka", "aiko@meridianlabs.jp", "Meridian Labs"],
  ["Liam O'Connor", "liam@foundryworks.ie", "Foundry Works"],
  ["Nadia Hassan", "nadia@cedarbank.com", "Cedar Bank"],
  ["Tom Becker", "tom@packwise.de", "Packwise"],
  ["Grace Kim", "grace@lumenpay.com", "Lumen Pay"],
  ["Diego Costa", "diego@velatravel.br", "Vela Travel"],
  ["Hannah Ross", "hannah@orbitmedia.com", "Orbit Media"],
  ["Yusuf Demir", "yusuf@atlaslogix.com", "Atlas Logix"],
  ["Elena Petrova", "elena@northgate.io", "Northgate"],
  ["Chris Dupont", "chris@fernwood.co", "Fernwood"],
] as const;

const TAGS = [
  ["Billing", "#f59e0b"],
  ["Bug", "#ef4444"],
  ["Feature request", "#6366f1"],
  ["Onboarding", "#10b981"],
  ["API", "#06b6d4"],
  ["Mobile", "#8b5cf6"],
  ["Account", "#64748b"],
  ["Integrations", "#ec4899"],
] as const;

const SUBJECTS = [
  "Can't log in after password reset",
  "Invoice shows the wrong amount",
  "Feature request: dark mode for reports",
  "API returns 500 on bulk export",
  "Mobile app crashes on file upload",
  "How do I add a teammate?",
  "Webhook stopped firing yesterday",
  "Switch billing from monthly to annual",
  "Data import stuck at 90%",
  "SSO with Okta isn't working",
  "CSV export is missing columns",
  "Two-factor code never arrives",
  "Hitting the rate limit unexpectedly",
  "Onboarding checklist won't complete",
  "Getting duplicate email notifications",
  "Account was marked inactive by mistake",
  "Timezone is wrong in the weekly digest",
  "Search returns nothing for my tags",
  "Attachment preview is broken in Safari",
  "Refund request for last month's charge",
  "Upgrade plan to add more seats",
  "Dashboard is slow to load in the morning",
  "Can't delete an archived project",
  "Reset emails are landing in spam",
  "Slack integration keeps disconnecting",
  "Need an invoice with our VAT number",
  "Bulk-assign tickets to a teammate",
  "Charts render blank on first load",
  "Where can I download old reports?",
  "Please merge two duplicate accounts",
] as const;

const bodyFor = (subject: string, contact: string, company: string) =>
  `Hi team,\n\n${contact} from ${company} here. ${subject}. ` +
  `It started recently and is affecting our workflow — could you take a look and let us know the next steps?\n\nThanks!`;

const PUBLIC_REPLIES = [
  "Thanks for reaching out — I'm looking into this now and will update you shortly.",
  "Good news: we've reproduced the issue and a fix is on the way.",
  "Could you share a screenshot or the exact time this happened so we can dig deeper?",
  "We've applied a fix on our end. Can you confirm it's working for you now?",
  "I've refunded the charge — it should appear within 3–5 business days.",
];
const INTERNAL_NOTES = [
  "Escalated to engineering — looks related to last week's deploy.",
  "Customer is on the Pro plan; prioritize.",
  "Root cause: stale cache. Cleared and monitoring.",
  "Waiting on the customer to confirm before closing.",
  "Duplicate of an earlier ticket from the same org.",
];

async function clear() {
  // FK-safe order.
  await prisma.auditLog.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.ticketEvent.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticketTag.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function main() {
  console.log("🌱 Seeding Deskly…");
  await clear();

  const org = await prisma.organization.create({
    data: { name: "Northwind Support", slug: "northwind" },
  });

  const passwordHash = await hash(PASSWORD, 12);
  const verifiedAt = daysAgo(60);
  const mk = (name: string, email: string, role: string) =>
    prisma.user.create({
      data: {
        name,
        email,
        role,
        orgId: org.id,
        passwordHash,
        emailVerified: verifiedAt,
      },
    });

  const owner = await mk("Ava Bennett", "owner@deskly.app", "OWNER");
  const admin = await mk("Demo Admin", "demo@deskly.app", "ADMIN");
  const maya = await mk("Maya Chen", "maya@deskly.app", "AGENT");
  const leo = await mk("Leo Martins", "leo@deskly.app", "AGENT");
  const sam = await mk("Sam Reed", "sam@deskly.app", "AGENT");
  await mk("Val Nguyen", "viewer@deskly.app", "VIEWER");
  const agents = [maya, leo, sam, admin, owner];

  const contacts = [];
  for (const [name, email, company] of CONTACTS) {
    contacts.push(
      await prisma.contact.create({
        data: { orgId: org.id, name, email, company },
      }),
    );
  }

  const tags = [];
  for (const [name, color] of TAGS) {
    tags.push(
      await prisma.tag.create({ data: { orgId: org.id, name, color } }),
    );
  }

  let ticketNumber = 1000;
  const auditRows: {
    action: string;
    entity: string;
    entityId: string;
    summary: string;
    actorId: string | null;
    createdAt: Date;
  }[] = [];

  const TICKET_COUNT = 64;
  for (let i = 0; i < TICKET_COUNT; i++) {
    ticketNumber += 1;
    const subject = SUBJECTS[i % SUBJECTS.length]!;
    const contact = pick(contacts);
    const status = weighted([
      ["OPEN", 26],
      ["IN_PROGRESS", 20],
      ["WAITING", 12],
      ["RESOLVED", 22],
      ["CLOSED", 20],
    ] as const);
    const priority = weighted([
      ["LOW", 20],
      ["MEDIUM", 40],
      ["HIGH", 28],
      ["URGENT", 12],
    ] as const);
    const createdAgo = Math.floor(rand() * 45);
    const createdAt = daysAgo(createdAgo, Math.floor(rand() * 24));
    const assignee =
      status === "OPEN" && rand() < 0.4 ? null : pick(agents);
    const resolved = status === "RESOLVED" || status === "CLOSED";
    const firstResponseAt =
      assignee && rand() < 0.85
        ? new Date(createdAt.getTime() + Math.floor(rand() * 8 + 1) * 3_600_000)
        : null;
    const resolvedAt = resolved
      ? new Date(
          createdAt.getTime() + Math.floor(rand() * 6 + 1) * 86_400_000,
        )
      : null;

    const ticket = await prisma.ticket.create({
      data: {
        orgId: org.id,
        number: ticketNumber,
        subject,
        body: bodyFor(subject, contact.name, contact.company ?? "their team"),
        status,
        priority,
        assigneeId: assignee?.id ?? null,
        contactId: contact.id,
        firstResponseAt,
        resolvedAt,
        createdAt,
        updatedAt: resolvedAt ?? firstResponseAt ?? createdAt,
      },
    });

    // Tags (0–2).
    const tagCount = Math.floor(rand() * 3);
    const chosen = new Set<string>();
    for (let t = 0; t < tagCount; t++) chosen.add(pick(tags).id);
    for (const tagId of chosen) {
      await prisma.ticketTag.create({ data: { ticketId: ticket.id, tagId } });
    }

    // Timeline: created event.
    await prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "created",
        actorId: assignee?.id ?? null,
        createdAt,
      },
    });

    // Comments (0–3).
    const commentCount = Math.floor(rand() * 4);
    for (let c = 0; c < commentCount; c++) {
      const internal = rand() < 0.35;
      await prisma.comment.create({
        data: {
          ticketId: ticket.id,
          authorId: (assignee ?? pick(agents)).id,
          body: internal ? pick(INTERNAL_NOTES) : pick(PUBLIC_REPLIES),
          isInternal: internal,
          createdAt: new Date(
            createdAt.getTime() + (c + 1) * Math.floor(rand() * 6 + 1) * 3_600_000,
          ),
        },
      });
    }

    auditRows.push({
      action: "ticket.created",
      entity: "ticket",
      entityId: ticket.id,
      summary: `Created ticket #${ticket.number} — ${subject}`,
      actorId: assignee?.id ?? admin.id,
      createdAt,
    });
    if (resolved) {
      auditRows.push({
        action: "ticket.status_changed",
        entity: "ticket",
        entityId: ticket.id,
        summary: `Marked ticket #${ticket.number} as ${status.toLowerCase()}`,
        actorId: (assignee ?? admin).id,
        createdAt: resolvedAt ?? createdAt,
      });
    }
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: { ticketCounter: ticketNumber },
  });

  for (const row of auditRows) {
    await prisma.auditLog.create({ data: { orgId: org.id, ...row } });
  }

  await prisma.savedView.createMany({
    data: [
      {
        orgId: org.id,
        name: "Urgent & unassigned",
        query: "priority=URGENT&assignee=unassigned&status=OPEN",
        createdById: admin.id,
      },
      {
        orgId: org.id,
        name: "In progress",
        query: "status=IN_PROGRESS&sort=priority&dir=desc",
        createdById: admin.id,
      },
      {
        orgId: org.id,
        name: "Resolved recently",
        query: "status=RESOLVED&sort=updatedAt&dir=desc",
        createdById: owner.id,
      },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    contacts: await prisma.contact.count(),
    tickets: await prisma.ticket.count(),
    comments: await prisma.comment.count(),
    auditLogs: await prisma.auditLog.count(),
  };
  console.log("✅ Seed complete:", counts);
  console.log(`   Demo login → demo@deskly.app / ${PASSWORD} (admin)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
