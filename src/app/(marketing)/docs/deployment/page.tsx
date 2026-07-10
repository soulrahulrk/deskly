import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deployment",
  description: "Run Deskly locally in a few commands, or deploy your own copy to Vercel.",
  alternates: { canonical: "/docs/deployment" },
};

export default function DeploymentPage() {
  return (
    <article className="mx-auto max-w-[680px] px-4 py-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground">
          Docs
        </Link>
        <ChevronRight className="size-3.5" />
        <span aria-current="page" className="text-foreground">
          Deployment
        </span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">Deployment</h1>
      <p className="mt-3 text-muted-foreground">
        Deskly is a standard Next.js app with a SQLite-compatible database, so it runs almost
        anywhere. Here&apos;s the fastest path.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold tracking-tight">Run it locally</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs">
{`git clone ${siteConfig.links.github}
cd deskly
cp .env.example .env   # then fill in AUTH_SECRET (npx auth secret)
npm install
npm run db:migrate && npm run db:seed
npm run dev             # http://localhost:3000`}
          </pre>
          <p className="mt-3">
            No Postgres, no Docker, no external services required — the database is a local
            SQLite file.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">Deploy to Vercel</h2>
          <p className="mt-3">
            Push the repo to GitHub, then import it at{" "}
            <span className="font-medium">vercel.com/new</span> — it auto-detects Next.js. Add the
            environment variables from <code className="rounded bg-muted px-1 py-0.5">.env.example</code>{" "}
            under Project Settings &rarr; Environment Variables.
          </p>
          <p className="mt-3">
            For a persistent production database, point <code className="rounded bg-muted px-1 py-0.5">DATABASE_URL</code>{" "}
            at a{" "}
            <a
              href="https://turso.tech"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Turso
            </a>{" "}
            database (SQLite-compatible, generous free tier — the same libSQL driver adapter used
            locally works unchanged) and set <code className="rounded bg-muted px-1 py-0.5">DATABASE_AUTH_TOKEN</code>.
            A managed Postgres instance works too with a one-line provider swap in{" "}
            <code className="rounded bg-muted px-1 py-0.5">prisma/schema.prisma</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">Before you call it deployed</h2>
          <ul className="mt-3 list-inside list-disc space-y-1.5">
            <li>The live URL loads with no console errors and no broken images</li>
            <li>Sign-up and login work end to end on the deployed URL, not just localhost</li>
            <li>Migrations have run against the production database</li>
            <li>No secret ever appears in the client bundle (only NEXT_PUBLIC_ variables can)</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
