import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, clientIp } from "./rate-limit";

describe("rateLimit()", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit, then blocks the next one", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).ok).toBe(true);
    }
    const sixth = rateLimit(key, 5, 60_000);
    expect(sixth.ok).toBe(false);
    expect(sixth.remaining).toBe(0);
    expect(sixth.retryAfter).toBeGreaterThan(0);
  });

  it("tracks separate buckets per key — one identity's limit doesn't affect another's", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(keyA, 5, 60_000);
    expect(rateLimit(keyA, 5, 60_000).ok).toBe(false);
    expect(rateLimit(keyB, 5, 60_000).ok).toBe(true);
  });

  it("resets the bucket once the time window elapses", () => {
    vi.useFakeTimers();
    const key = `window-${Math.random()}`;
    try {
      for (let i = 0; i < 5; i++) rateLimit(key, 5, 1_000);
      expect(rateLimit(key, 5, 1_000).ok).toBe(false);

      vi.advanceTimersByTime(1_001);

      expect(rateLimit(key, 5, 1_000).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("clientIp()", () => {
  it("prefers the first entry of x-forwarded-for over x-real-ip", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5, 70.41.3.18",
      "x-real-ip": "198.51.100.9",
    });
    expect(clientIp(headers)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.9" });
    expect(clientIp(headers)).toBe("198.51.100.9");
  });

  it("falls back to the literal string 'unknown' with no proxy headers at all", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
