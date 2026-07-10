import { describe, it, expect } from "vitest";
import { addMemberSchema, changeMemberRoleSchema } from "./member";

describe("addMemberSchema", () => {
  it("accepts a well-formed member invite", () => {
    const result = addMemberSchema.safeParse({
      name: "Jane Doe",
      email: "jane@acme.com",
      role: "AGENT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a role outside the known enum — never trust a role sent from the client", () => {
    const result = addMemberSchema.safeParse({
      name: "Jane Doe",
      email: "jane@acme.com",
      role: "SUPERADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = addMemberSchema.safeParse({ email: "jane@acme.com", role: "AGENT" });
    expect(result.success).toBe(false);
  });
});

describe("changeMemberRoleSchema", () => {
  it("accepts each of the four known roles", () => {
    for (const role of ["OWNER", "ADMIN", "AGENT", "VIEWER"]) {
      expect(changeMemberRoleSchema.safeParse({ role }).success).toBe(true);
    }
  });

  it("rejects an unknown role string", () => {
    expect(changeMemberRoleSchema.safeParse({ role: "SUPERUSER" }).success).toBe(false);
  });
});
