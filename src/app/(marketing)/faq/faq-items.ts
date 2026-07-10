export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Single source of truth for FAQ copy — rendered on the page and mirrored
 * into FAQPage JSON-LD (the visible text and the structured data must match
 * verbatim or Google strips the rich result).
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is Deskly free?",
    answer:
      "Yes. Deskly is open source under the MIT license — the whole codebase is on GitHub and free to self-host. There's no paid tier, no seat limits, and no feature gating.",
  },
  {
    question: "Can I self-host it?",
    answer:
      "That's the primary way to run it. Deskly is a standard Next.js app with a SQLite-compatible database — clone the repo, set a few environment variables, and deploy to Vercel (or any Node host) in a few minutes. See the deployment guide for the full walkthrough.",
  },
  {
    question: "Does it work offline?",
    answer:
      "No. Deskly is a server-rendered web app that talks to a database on every request — there's no offline cache or local-first sync layer. It needs a network connection like any typical SaaS dashboard.",
  },
  {
    question: "How is my data isolated from other organizations?",
    answer:
      "Every table that holds tenant data carries an organization id, and every database query in the app is scoped through a single data-access layer that filters by it — there's no code path that queries across organizations. This boundary is covered by an automated integration test, not just a convention.",
  },
  {
    question: "What happens when I remove a team member?",
    answer:
      "They lose access immediately, but their ticket assignments, comments, and audit history are preserved — removal detaches the account from the workspace rather than deleting it, so your support history stays intact.",
  },
  {
    question: "Who can see the audit log?",
    answer:
      "Owners and Admins. It records every meaningful change in the workspace — ticket edits, comments, member and role changes, profile updates — with who made the change, when, and a before/after snapshot.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. Export the current (filtered) ticket list to CSV at any time, or export a single ticket to a PDF. Both are generated on the server from your live data, so they always reflect what's actually in the database.",
  },
  {
    question: "How are passwords stored?",
    answer:
      "Hashed with bcrypt at a cost factor of 12 — plaintext passwords are never stored or logged, and sessions are signed, httpOnly cookies rather than anything readable from client-side JavaScript.",
  },
];
