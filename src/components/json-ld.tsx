/**
 * Server-rendered JSON-LD. Renders directly into the initial HTML (never
 * client-injected after hydration, per the brief's structured-data spec).
 * `dangerouslySetInnerHTML` is the standard, Next.js-endorsed pattern for
 * this — the content here always originates from our own typed objects,
 * never from user input, so there's no injection surface.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
