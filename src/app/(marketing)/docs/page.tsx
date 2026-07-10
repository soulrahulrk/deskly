import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Rocket, Layers, CloudUpload } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Get started with Deskly, explore what it can do, and deploy your own copy.",
  alternates: { canonical: "/docs" },
};

const PAGES = [
  {
    href: "/docs/getting-started",
    icon: Rocket,
    title: "Getting started",
    description: "Sign up, invite your team, and create your first ticket in a few minutes.",
  },
  {
    href: "/docs/features",
    icon: Layers,
    title: "Features",
    description: "What Deskly does today — tickets, analytics, roles, and the command palette.",
  },
  {
    href: "/docs/deployment",
    icon: CloudUpload,
    title: "Deployment",
    description: "Run it locally, or deploy your own copy to Vercel in a few minutes.",
  },
];

export default function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Documentation</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything you need to run Deskly — as a user, or as a developer standing up your own
        instance.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group rounded-xl border p-5 transition-colors hover:border-primary/50 hover:bg-accent/40"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <page.icon className="size-4 text-primary" />
            </div>
            <h2 className="mt-4 text-sm font-semibold">{page.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{page.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Read more <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
