import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, passwordSchema, emailSchema } from "./auth";

describe("emailSchema", () => {
  it("trims and lowercases a valid email", () => {
    const result = emailSchema.safeParse("  Jane@Example.COM  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("jane@example.com");
  });

  it("rejects a malformed email", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts exactly the 8-character minimum (boundary)", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(true);
  });

  it("rejects one character under the minimum (boundary)", () => {
    expect(passwordSchema.safeParse("1234567").success).toBe(false);
  });

  it("accepts exactly the 72-character maximum (bcrypt's own limit)", () => {
    expect(passwordSchema.safeParse("a".repeat(72)).success).toBe(true);
  });

  it("rejects one character over the maximum", () => {
    expect(passwordSchema.safeParse("a".repeat(73)).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a well-formed login", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("requires a non-empty password but doesn't enforce the 8-char rule (a legacy short password must still be able to log in)", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Jane Doe",
    orgName: "Acme Support",
    email: "jane@acme.com",
    password: "correcthorse",
  };

  it("accepts a well-formed registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a one-character workspace name (below the 2-char minimum)", () => {
    const result = registerSchema.safeParse({ ...valid, orgName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects a weak password even though the login schema would accept it", () => {
    expect(registerSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });
});
