import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword() / verifyPassword()", () => {
  it("verifies the correct password against its own hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("never stores the plaintext password in the hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toContain("correct horse battery staple");
  });

  it("salts each hash independently — hashing the same password twice gives different hashes", async () => {
    const hashA = await hashPassword("same-password");
    const hashB = await hashPassword("same-password");
    expect(hashA).not.toBe(hashB);
    // ...but both still verify correctly against the original password.
    expect(await verifyPassword("same-password", hashA)).toBe(true);
    expect(await verifyPassword("same-password", hashB)).toBe(true);
  });

  it("uses bcrypt cost 12, per the brief's 'bcrypt cost >=12' requirement", async () => {
    const hash = await hashPassword("anything");
    // bcrypt hash format: $2b$<cost>$<22-char salt><31-char hash>
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
  });
});
