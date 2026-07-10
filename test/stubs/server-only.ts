// Stub for the `server-only` bare-import guard. Next.js's bundler
// special-cases this import at build time (it isn't a real resolvable
// package); Vitest runs outside that bundler, so we alias it to this
// no-op so `import "server-only"` in lib files doesn't crash test runs.
export {};
