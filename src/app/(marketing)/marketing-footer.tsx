import Link from "next/link";
import { siteConfig } from "@/lib/site";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/docs", label: "Docs" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { href: "/register", label: "Create a workspace" },
      { href: "/login", label: "Sign in" },
      { href: "/docs/getting-started", label: "Getting started" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: siteConfig.links.github, label: "GitHub", external: true },
      { href: "/docs/deployment", label: "Deploy your own" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-lg font-bold tracking-tight text-primary">Deskly</span>
            <p className="mt-2 max-w-[220px] text-sm text-muted-foreground">
              {siteConfig.tagline}.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-sm font-semibold">{col.heading}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Deskly. MIT Licensed. Built for the Digital Heroes
            Full Stack Developer Trial.
          </p>
        </div>
      </div>
    </footer>
  );
}
