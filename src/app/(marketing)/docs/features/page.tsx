import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description: "A full tour of what Deskly does — tickets, analytics, roles, and more.",
  alternates: { canonical: "/docs/features" },
};

const SECTIONS = [
  {
    title: "Ticketing",
    body: "Create, assign, and comment on tickets with internal notes kept separate from customer-visible replies. Status (Open, In Progress, Waiting, Resolved, Closed) and priority (Low to Urgent) drive the dashboard and the queue. Every status, priority, and assignment change is written to a per-ticket timeline.",
  },
  {
    title: "Search, filter, sort, and pagination",
    body: "The ticket list is entirely server-side and URL-driven: search is debounced and hits the database, not a client-side array; status and priority filters compose with search; sorting works on indexed columns; pagination defaults to 25 rows a page. Every combination of filters is a shareable URL.",
  },
  {
    title: "Analytics",
    body: "The dashboard shows four KPIs (open tickets, resolved in the last 30 days, average first-response time, resolution rate), a volume trend chart, a status breakdown, a priority breakdown, and an agent leaderboard. The dedicated Analytics page adds a 7/30/90-day range selector and a fuller leaderboard.",
  },
  {
    title: "Roles and permissions",
    body: "Four roles — Owner, Admin, Agent, Viewer — each with a real, server-enforced ceiling. Only an Owner can grant Owner or Admin. An actor can only manage members ranked below their own role (an Owner can still manage a peer Owner, just never themselves). The last remaining Owner can never be demoted or removed.",
  },
  {
    title: "Audit log",
    body: "Every mutation — ticket changes, comments, contact edits, member and role changes, profile updates — writes an immutable row: who, what, when, and a before/after snapshot. It's paginated and filterable by entity from Settings → Audit log.",
  },
  {
    title: "Exports",
    body: "Export the currently filtered ticket list to CSV, or a single ticket to a branded PDF, both generated on the server.",
  },
  {
    title: "Command palette & keyboard support",
    body: "⌘K / Ctrl K opens a global search across tickets and contacts and doubles as quick navigation. Every interactive control has a visible focus ring and is reachable by keyboard alone.",
  },
  {
    title: "Dark mode",
    body: "A designed dark theme — not an inverted filter. Surfaces are elevated with lighter grays instead of shadows, the accent color is desaturated, and the theme is applied before first paint so there's no flash.",
  },
];

export default function FeaturesPage() {
  return (
    <article className="mx-auto max-w-[680px] px-4 py-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground">
          Docs
        </Link>
        <ChevronRight className="size-3.5" />
        <span aria-current="page" className="text-foreground">
          Features
        </span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">Features</h1>
      <p className="mt-3 text-muted-foreground">
        Everything currently built and working in Deskly — no roadmap items, no vaporware.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-3">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
