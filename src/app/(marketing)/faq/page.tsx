import type { Metadata } from "next";
import { FAQ_ITEMS } from "./faq-items";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about pricing, self-hosting, data, and security in Deskly.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h1>
      <p className="mt-3 text-muted-foreground">
        Can&apos;t find what you&apos;re after? Open an issue on{" "}
        <a
          href="https://github.com/soulrahulrk/deskly/issues"
          className="text-primary underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>

      <dl className="mt-10 divide-y">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className="py-6 first:pt-0">
            <dt className="text-base font-semibold">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
