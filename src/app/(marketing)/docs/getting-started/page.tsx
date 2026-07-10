import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { docsBreadcrumbJsonLd } from "../breadcrumb-json-ld";

export const metadata: Metadata = {
  title: "Getting started",
  description: "Create a workspace, invite your team, and create your first ticket in Deskly.",
  alternates: { canonical: "/docs/getting-started" },
};

export default function GettingStartedPage() {
  return (
    <article className="mx-auto max-w-[680px] px-4 py-16 sm:px-6">
      <JsonLd data={docsBreadcrumbJsonLd("Getting started", "/docs/getting-started")} />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground">
          Docs
        </Link>
        <ChevronRight className="size-3.5" />
        <span aria-current="page" className="text-foreground">
          Getting started
        </span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">Getting started</h1>
      <p className="mt-3 text-muted-foreground">
        From an empty workspace to your first resolved ticket, in about three minutes.
      </p>

      <div className="prose-content mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold tracking-tight">1. Create your workspace</h2>
          <p className="mt-3">
            Head to{" "}
            <Link href="/register" className="text-primary underline underline-offset-2">
              /register
            </Link>{" "}
            and fill in your name, a workspace name, your email, and a password. This creates a
            new organization with you as its <strong>Owner</strong> — the only role that can later
            hand out Owner or Admin to teammates.
          </p>
          <p className="mt-3">
            There&apos;s no email provider wired up in this deployment, so instead of waiting for
            a verification email, the confirmation link is shown right on screen. Click it (or
            open the &ldquo;Try the demo&rdquo; link on the homepage instead, if you&apos;d rather
            skip setup entirely).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">2. Add your team</h2>
          <p className="mt-3">
            Go to <strong>Settings &rarr; Members &rarr; Add member</strong>. Pick a role — Admin
            can manage members and settings; Agent can work tickets; Viewer is read-only. Since
            there&apos;s no email provider, you&apos;ll get a claim-account link to share with
            them directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">3. Create your first ticket</h2>
          <p className="mt-3">
            From <strong>Tickets &rarr; New ticket</strong>, fill in a subject, description, and
            pick (or create) a contact. Assign it to a teammate, or leave it unassigned. Every
            change from here — status, priority, comments — is recorded in the audit log
            automatically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">4. Find things fast</h2>
          <p className="mt-3">
            Press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>{" "}
            (or <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl K</kbd>{" "}
            on Windows/Linux) from anywhere in the app to search tickets and contacts, or jump to
            any page, without touching the mouse.
          </p>
        </section>
      </div>
    </article>
  );
}
