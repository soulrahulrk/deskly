import { describe, it, expect } from "vitest";
import { createToken, hashToken } from "./tokens";

describe("hashToken()", () => {
  it("is deterministic — the same input always hashes the same way", () => {
    expect(hashToken("abc123")).toBe(hashToken("abc123"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashToken("abc123")).not.toBe(hashToken("abc124"));
  });

  it("never returns the plaintext input", () => {
    expect(hashToken("my-secret-token")).not.toBe("my-secret-token");
  });
});

describe("createToken()", () => {
  it("returns a token whose hash matches hashToken(token) — the pair is self-consistent", () => {
    const { token, tokenHash } = createToken();
    expect(hashToken(token)).toBe(tokenHash);
  });

  it("generates a fresh, unpredictable token on every call", () => {
    const a = createToken();
    const b = createToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it("produces a URL-safe token with enough entropy to resist guessing", () => {
    const { token } = createToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(32);
  });
});
